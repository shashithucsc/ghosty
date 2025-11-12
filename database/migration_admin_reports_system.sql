-- =============================================
-- Ghosty Admin Panel & Reporting System Migration
-- =============================================
-- This migration creates the reports table and admin
-- management functionality
-- =============================================

-- =============================================
-- 1. REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN (
        'inappropriate_content',
        'harassment',
        'fake_profile',
        'spam',
        'underage',
        'other'
    )),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: User cannot report themselves
    CONSTRAINT cannot_self_report CHECK (reporter_id != reported_user_id),
    
    -- Constraint: One report per user pair per day (prevent spam reporting)
    CONSTRAINT unique_daily_report UNIQUE (reporter_id, reported_user_id, date_trunc('day', created_at))
);

-- =============================================
-- 2. ADD MISSING COLUMNS TO USERS TABLE (if needed)
-- =============================================

-- Add report_count if not exists (tracks total reports against user)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'report_count'
    ) THEN
        ALTER TABLE users ADD COLUMN report_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add total_reports if not exists (alternative name, check your schema)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'total_reports'
    ) THEN
        ALTER TABLE users ADD COLUMN total_reports INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add is_restricted if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_restricted'
    ) THEN
        ALTER TABLE users ADD COLUMN is_restricted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add admin_role if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'admin_role'
    ) THEN
        ALTER TABLE users ADD COLUMN admin_role BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =============================================
-- 3. INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_reported_user_status ON reports(reported_user_id, status);

-- Index for admin panel filters
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_is_restricted ON users(is_restricted) WHERE is_restricted = TRUE;
CREATE INDEX idx_users_report_count ON users(report_count DESC) WHERE report_count > 0;
CREATE INDEX idx_users_admin_role ON users(admin_role) WHERE admin_role = TRUE;

-- =============================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- =============================================
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. TRIGGER TO UPDATE REPORT COUNT
-- =============================================

-- Function to increment report count when report is created
CREATE OR REPLACE FUNCTION increment_user_report_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update both report_count and total_reports columns
    UPDATE users
    SET 
        report_count = COALESCE(report_count, 0) + 1,
        total_reports = COALESCE(total_reports, 0) + 1
    WHERE id = NEW.reported_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_count
    AFTER INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION increment_user_report_count();

-- Function to decrement report count when report is deleted
CREATE OR REPLACE FUNCTION decrement_user_report_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        report_count = GREATEST(COALESCE(report_count, 0) - 1, 0),
        total_reports = GREATEST(COALESCE(total_reports, 0) - 1, 0)
    WHERE id = OLD.reported_user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_report_count
    AFTER DELETE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION decrement_user_report_count();

-- =============================================
-- 6. HELPER FUNCTIONS
-- =============================================

-- Function to get user reports summary
CREATE OR REPLACE FUNCTION get_user_reports_summary(user_uuid UUID)
RETURNS TABLE (
    total_reports_count BIGINT,
    pending_reports BIGINT,
    reviewed_reports BIGINT,
    is_restricted BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_reports_count,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_reports,
        COUNT(*) FILTER (WHERE status IN ('reviewed', 'resolved', 'dismissed'))::BIGINT as reviewed_reports,
        COALESCE(u.is_restricted, FALSE) as is_restricted
    FROM reports r
    JOIN users u ON u.id = user_uuid
    WHERE r.reported_user_id = user_uuid
    GROUP BY u.is_restricted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restrict user account
CREATE OR REPLACE FUNCTION restrict_user_account(
    user_uuid UUID,
    admin_uuid UUID,
    reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update user to restricted status
    UPDATE users
    SET 
        is_restricted = TRUE,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log the restriction (you can add to audit log table if exists)
    -- For now, just return success
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unrestrict user account
CREATE OR REPLACE FUNCTION unrestrict_user_account(
    user_uuid UUID,
    admin_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users
    SET 
        is_restricted = FALSE,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT COALESCE(admin_role, FALSE) INTO is_admin
    FROM users
    WHERE id = user_uuid;
    
    RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_users BIGINT,
    verified_users BIGINT,
    pending_verification BIGINT,
    restricted_users BIGINT,
    pending_reports BIGINT,
    total_reports BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT u.id)::BIGINT as total_users,
        COUNT(DISTINCT u.id) FILTER (WHERE u.verification_status = 'verified')::BIGINT as verified_users,
        COUNT(DISTINCT u.id) FILTER (WHERE u.verification_status = 'pending')::BIGINT as pending_verification,
        COUNT(DISTINCT u.id) FILTER (WHERE u.is_restricted = TRUE)::BIGINT as restricted_users,
        COUNT(r.id) FILTER (WHERE r.status = 'pending')::BIGINT as pending_reports,
        COUNT(r.id)::BIGINT as total_reports
    FROM users u
    LEFT JOIN reports r ON TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view reports they created
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Users can create reports (but not against themselves)
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id AND
        reporter_id != reported_user_id
    );

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND admin_role = TRUE
        )
    );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND admin_role = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND admin_role = TRUE
        )
    );

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
    ON reports FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND admin_role = TRUE
        )
    );

-- =============================================
-- 8. ADMIN AUDIT LOG TABLE (optional but recommended)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'approve_verification',
        'reject_verification',
        'restrict_user',
        'unrestrict_user',
        'delete_user',
        'review_report',
        'dismiss_report'
    )),
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_resource_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "Admins can view audit log"
    ON admin_actions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND admin_role = TRUE
        )
    );

-- System can insert audit log entries
CREATE POLICY "System can insert audit log"
    ON admin_actions FOR INSERT
    WITH CHECK (TRUE);

-- =============================================
-- 9. VALIDATION CONSTRAINTS
-- =============================================

-- Ensure description is not empty if reason is 'other'
ALTER TABLE reports
ADD CONSTRAINT description_required_for_other 
CHECK (
    (reason != 'other') OR 
    (reason = 'other' AND description IS NOT NULL AND LENGTH(TRIM(description)) > 0)
);

-- Limit description length
ALTER TABLE reports
ADD CONSTRAINT description_max_length
CHECK (description IS NULL OR LENGTH(description) <= 1000);

-- =============================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE reports IS 'Stores user reports for moderation';
COMMENT ON TABLE admin_actions IS 'Audit log for admin actions';
COMMENT ON COLUMN reports.reason IS 'Reason for report: inappropriate_content, harassment, fake_profile, spam, underage, other';
COMMENT ON COLUMN reports.status IS 'Report status: pending, reviewed, resolved, dismissed';
COMMENT ON COLUMN users.is_restricted IS 'Whether user account is restricted by admin';
COMMENT ON COLUMN users.admin_role IS 'Whether user has admin privileges';

-- =============================================
-- 11. INITIAL ADMIN SETUP (MANUAL STEP)
-- =============================================
-- After migration, manually set your admin account:
-- UPDATE users SET admin_role = TRUE WHERE username = 'your_admin_username';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Next steps:
-- 1. Set at least one user as admin (UPDATE users SET admin_role = TRUE...)
-- 2. Test report creation and count updates
-- 3. Test admin functions (restrict, unrestrict, etc.)
-- 4. Deploy admin panel APIs
-- 5. Test complete admin workflow
-- =============================================
