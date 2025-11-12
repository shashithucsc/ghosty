-- ============================================
-- GHOSTY RECOMMENDATION FEED SCHEMA
-- Database tables for matching, swiping, and reporting
-- ============================================

-- This migration adds:
-- 1. Swipes table (like/skip actions)
-- 2. Matches table (mutual likes)
-- 3. Blocks table (blocked users)
-- 4. Reports table (user reports)

BEGIN;

-- =====================================================
-- SWIPES TABLE
-- Records user like/skip actions
-- =====================================================

CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'skip')),
  swiped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only swipe once per target
  UNIQUE(swiper_user_id, target_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_action ON swipes(action);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped_at ON swipes(swiped_at);

-- =====================================================
-- MATCHES TABLE
-- Records mutual likes between users
-- =====================================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unmatched_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate matches
  CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON matches(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);

-- =====================================================
-- BLOCKS TABLE
-- Records blocked users
-- =====================================================

CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate blocks
  UNIQUE(blocker_user_id, blocked_user_id),
  
  -- Prevent self-blocking
  CHECK (blocker_user_id != blocked_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_at ON blocks(blocked_at);

-- =====================================================
-- REPORTS TABLE
-- Records user reports for inappropriate behavior
-- =====================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'fake_profile',
    'harassment',
    'spam',
    'underage',
    'other'
  )),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent self-reporting
  CHECK (reporter_user_id != reported_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reason ON reports(reason);
CREATE INDEX IF NOT EXISTS idx_reports_reported_at ON reports(reported_at);

-- =====================================================
-- TRIGGERS
-- Auto-update updated_at timestamps
-- =====================================================

-- Swipes trigger
DROP TRIGGER IF EXISTS update_swipes_updated_at ON swipes;
CREATE TRIGGER update_swipes_updated_at
BEFORE UPDATE ON swipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Matches trigger
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Reports trigger
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Swipes policies
DROP POLICY IF EXISTS "Users can view own swipes" ON swipes;
CREATE POLICY "Users can view own swipes" ON swipes
  FOR SELECT USING (auth.uid() = swiper_user_id);

DROP POLICY IF EXISTS "Users can create own swipes" ON swipes;
CREATE POLICY "Users can create own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_user_id);

DROP POLICY IF EXISTS "Users can update own swipes" ON swipes;
CREATE POLICY "Users can update own swipes" ON swipes
  FOR UPDATE USING (auth.uid() = swiper_user_id);

DROP POLICY IF EXISTS "Admins can view all swipes" ON swipes;
CREATE POLICY "Admins can view all swipes" ON swipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Matches policies
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can update own matches" ON matches;
CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Admins can view all matches" ON matches;
CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Blocks policies
DROP POLICY IF EXISTS "Users can view own blocks" ON blocks;
CREATE POLICY "Users can view own blocks" ON blocks
  FOR SELECT USING (auth.uid() = blocker_user_id);

DROP POLICY IF EXISTS "Users can create blocks" ON blocks;
CREATE POLICY "Users can create blocks" ON blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_user_id);

DROP POLICY IF EXISTS "Users can delete own blocks" ON blocks;
CREATE POLICY "Users can delete own blocks" ON blocks
  FOR DELETE USING (auth.uid() = blocker_user_id);

DROP POLICY IF EXISTS "Admins can view all blocks" ON blocks;
CREATE POLICY "Admins can view all blocks" ON blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Reports policies
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can update reports" ON reports;
CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if two users are matched
CREATE OR REPLACE FUNCTION are_users_matched(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM matches
    WHERE (user1_id = user1 AND user2_id = user2)
       OR (user1_id = user2 AND user2_id = user1)
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get match count for a user
CREATE OR REPLACE FUNCTION get_user_match_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM matches
    WHERE (user1_id = user_id OR user2_id = user_id)
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get report count for a user
CREATE OR REPLACE FUNCTION get_user_report_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM reports
    WHERE reported_user_id = user_id
    AND status IN ('pending', 'reviewed')
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(blocker UUID, blocked UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocks
    WHERE blocker_user_id = blocker AND blocked_user_id = blocked
  );
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- =====================================================

-- Check table creation
SELECT 
  'Migration completed successfully!' as message,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'swipes') as swipes_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'matches') as matches_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'blocks') as blocks_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'reports') as reports_exists;

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('swipes', 'matches', 'blocks', 'reports')
ORDER BY tablename, indexname;

-- Check constraints
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid::regclass::text IN ('swipes', 'matches', 'blocks', 'reports')
ORDER BY table_name, constraint_name;
