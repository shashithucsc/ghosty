-- =============================================
-- Ghosty User Verification System Migration
-- =============================================
-- This migration creates the verification_files table
-- for managing user verification documents
-- =============================================

-- =============================================
-- 1. VERIFICATION FILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS verification_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('facebook', 'student_id', 'academic')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: One active verification per user
    CONSTRAINT unique_pending_verification UNIQUE (user_id, status)
);

-- =============================================
-- 2. PROFILES TABLE (if not exists)
-- =============================================
-- Add verified column to profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'verified'
    ) THEN
        ALTER TABLE profiles ADD COLUMN verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =============================================
-- 3. INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_verification_files_user_id ON verification_files(user_id);
CREATE INDEX idx_verification_files_status ON verification_files(status);
CREATE INDEX idx_verification_files_created_at ON verification_files(created_at DESC);
CREATE INDEX idx_verification_files_user_status ON verification_files(user_id, status);

-- =============================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- =============================================
CREATE TRIGGER update_verification_files_updated_at
    BEFORE UPDATE ON verification_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to get user verification status
CREATE OR REPLACE FUNCTION get_user_verification_status(user_uuid UUID)
RETURNS TABLE (
    is_verified BOOLEAN,
    has_pending_verification BOOLEAN,
    latest_status TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.verified, FALSE) as is_verified,
        EXISTS(
            SELECT 1 FROM verification_files 
            WHERE user_id = user_uuid AND status = 'pending'
        ) as has_pending_verification,
        (
            SELECT vf.status FROM verification_files vf
            WHERE vf.user_id = user_uuid
            ORDER BY vf.created_at DESC
            LIMIT 1
        ) as latest_status,
        (
            SELECT vf.created_at FROM verification_files vf
            WHERE vf.user_id = user_uuid
            ORDER BY vf.created_at DESC
            LIMIT 1
        ) as submitted_at
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve verification
CREATE OR REPLACE FUNCTION approve_verification(
    verification_id UUID,
    admin_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_file_url TEXT;
    v_status TEXT;
BEGIN
    -- Get verification details
    SELECT user_id, file_url, status 
    INTO v_user_id, v_file_url, v_status
    FROM verification_files
    WHERE id = verification_id;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Verification not found';
    END IF;
    
    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'Verification already processed';
    END IF;
    
    -- Update verification status
    UPDATE verification_files
    SET 
        status = 'approved',
        reviewed_by = admin_id,
        reviewed_at = NOW(),
        admin_notes = notes
    WHERE id = verification_id;
    
    -- Mark user as verified in profiles
    UPDATE profiles
    SET verified = TRUE
    WHERE user_id = v_user_id;
    
    -- Also update users table verification_status
    UPDATE users
    SET verification_status = 'verified'
    WHERE id = v_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject verification
CREATE OR REPLACE FUNCTION reject_verification(
    verification_id UUID,
    admin_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
BEGIN
    -- Get verification details
    SELECT user_id, status 
    INTO v_user_id, v_status
    FROM verification_files
    WHERE id = verification_id;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Verification not found';
    END IF;
    
    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'Verification already processed';
    END IF;
    
    -- Update verification status
    UPDATE verification_files
    SET 
        status = 'rejected',
        reviewed_by = admin_id,
        reviewed_at = NOW(),
        admin_notes = notes
    WHERE id = verification_id;
    
    -- Update users table verification_status
    UPDATE users
    SET verification_status = 'rejected'
    WHERE id = v_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE verification_files ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification files
CREATE POLICY "Users can view own verifications"
    ON verification_files FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own verification files
CREATE POLICY "Users can upload verifications"
    ON verification_files FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending verifications (e.g., resubmit)
CREATE POLICY "Users can update own pending verifications"
    ON verification_files FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all verifications (TODO: Add admin role check)
CREATE POLICY "Admins can view all verifications"
    ON verification_files FOR SELECT
    USING (
        -- TODO: Replace with actual admin check
        -- Example: EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
        TRUE
    );

-- Admins can update any verification (TODO: Add admin role check)
CREATE POLICY "Admins can update verifications"
    ON verification_files FOR UPDATE
    USING (
        -- TODO: Replace with actual admin check
        TRUE
    );

-- =============================================
-- 7. STORAGE BUCKET SETUP (Run manually in Supabase Dashboard)
-- =============================================
-- Create a PRIVATE storage bucket named "verification_files"
-- Settings:
-- - Public: NO (private bucket)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/jpg, application/pdf
-- 
-- Storage RLS Policies:
-- 1. Users can upload to their own folder:
--    Name: "Users can upload verification files"
--    Operation: INSERT
--    Policy: bucket_id = 'verification_files' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- 2. Admins can view all files:
--    Name: "Admins can view verification files"
--    Operation: SELECT
--    Policy: bucket_id = 'verification_files' AND <admin_check>
--
-- 3. System can delete after approval:
--    Name: "System can delete processed files"
--    Operation: DELETE
--    Policy: bucket_id = 'verification_files'

-- =============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE verification_files IS 'Stores user verification document submissions';
COMMENT ON COLUMN verification_files.file_type IS 'Type of verification: facebook, student_id, or academic';
COMMENT ON COLUMN verification_files.status IS 'Verification status: pending, approved, or rejected';
COMMENT ON COLUMN verification_files.admin_notes IS 'Optional notes from admin reviewer';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Next steps:
-- 1. Create private storage bucket "verification_files" in Supabase Dashboard
-- 2. Configure storage RLS policies
-- 3. Deploy verification upload API
-- 4. Deploy admin verification management API
-- 5. Test complete verification workflow
-- =============================================
