-- Create swipes table to track user interactions (like/skip)
CREATE TABLE IF NOT EXISTS public.swipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  swiper_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('like', 'skip')),
  swiped_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT swipes_pkey PRIMARY KEY (id),
  CONSTRAINT swipes_swiper_fkey FOREIGN KEY (swiper_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT swipes_target_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT swipes_unique_pair UNIQUE (swiper_user_id, target_user_id),
  CONSTRAINT swipes_no_self_swipe CHECK (swiper_user_id <> target_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON public.swipes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_action ON public.swipes(action);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped_at ON public.swipes(swiped_at DESC);

-- Create matches table (for when both users like each other)
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  matched_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_user1_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT matches_user2_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT matches_unique_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT matches_no_self_match CHECK (user1_id <> user2_id)
);

-- Create indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON public.matches(matched_at DESC);

COMMENT ON TABLE public.swipes IS 'Tracks user swipe actions (like/skip) on recommendation profiles';
COMMENT ON TABLE public.matches IS 'Stores mutual likes (matches) between users';
