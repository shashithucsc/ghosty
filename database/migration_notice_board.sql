-- Notice Board System Migration
-- Run this migration to create the notice_board table

-- Create the notice_board table
CREATE TABLE IF NOT EXISTS public.notice_board (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('girl', 'boy', 'general')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_admin_post boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid,
  rejection_reason text,
  CONSTRAINT notice_board_pkey PRIMARY KEY (id),
  CONSTRAINT notice_board_author_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT notice_board_approver_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notice_board_status ON public.notice_board(status);
CREATE INDEX IF NOT EXISTS idx_notice_board_author ON public.notice_board(author_id);
CREATE INDEX IF NOT EXISTS idx_notice_board_category ON public.notice_board(category);
CREATE INDEX IF NOT EXISTS idx_notice_board_created_at ON public.notice_board(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notice_board_approved ON public.notice_board(status, created_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_notice_board_category_approved ON public.notice_board(category, status, created_at DESC) WHERE status = 'approved';

-- Enable Row Level Security
ALTER TABLE public.notice_board ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved posts
CREATE POLICY "Anyone can view approved posts" ON public.notice_board
  FOR SELECT
  USING (status = 'approved');

-- Policy: Users can view their own posts (regardless of status)
CREATE POLICY "Users can view own posts" ON public.notice_board
  FOR SELECT
  USING (author_id = auth.uid());

-- Policy: Verified users can insert posts
CREATE POLICY "Verified users can create posts" ON public.notice_board
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own pending posts
CREATE POLICY "Users can update own pending posts" ON public.notice_board
  FOR UPDATE
  USING (author_id = auth.uid() AND status = 'pending');

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON public.notice_board
  FOR DELETE
  USING (author_id = auth.uid());

-- Comments explaining the schema:
-- id: Unique identifier for each post
-- author_id: Reference to the user who created the post
-- title: Title of the notice board post
-- content: Main content/body of the post
-- category: 'girl' (for girls), 'boy' (for boys), 'general' (for everyone)
-- status: 'pending' (awaiting approval), 'approved' (visible to all), 'rejected' (not approved)
-- is_admin_post: If true, post was created by admin and doesn't need approval
-- created_at: Timestamp when post was created
-- updated_at: Timestamp when post was last updated
-- approved_at: Timestamp when post was approved
-- approved_by: Reference to admin who approved the post
-- rejection_reason: Reason given if post was rejected
