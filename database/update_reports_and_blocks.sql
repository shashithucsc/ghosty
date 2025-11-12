-- =============================================
-- Update Reports Table & Create Blocks Table
-- =============================================

-- 1. Add missing fields to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Create blocks table
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT blocks_pkey PRIMARY KEY (id),
  CONSTRAINT blocks_blocker_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT blocks_blocked_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT blocks_no_self_block CHECK (blocker_id != blocked_id),
  CONSTRAINT blocks_unique UNIQUE (blocker_id, blocked_id)
);

-- Add indexes for blocks table
CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON public.blocks(blocked_id);
CREATE INDEX idx_blocks_created_at ON public.blocks(created_at DESC);

-- 3. Add helper function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.blocks
        WHERE (blocker_id = user_a AND blocked_id = user_b)
           OR (blocker_id = user_b AND blocked_id = user_a)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add comments
COMMENT ON TABLE public.blocks IS 'Stores user block relationships';
COMMENT ON COLUMN public.blocks.blocker_id IS 'User who initiated the block';
COMMENT ON COLUMN public.blocks.blocked_id IS 'User who was blocked';
COMMENT ON COLUMN public.reports.status IS 'Status: pending, reviewed, resolved, dismissed';
COMMENT ON COLUMN public.reports.description IS 'Detailed description of the report';

-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- =============================================
