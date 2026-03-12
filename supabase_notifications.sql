-- Run this in your Supabase SQL Editor

-- 1. Create the sequence and table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The user RECEIVING the notification
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The user CAUSING the notification
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')), -- The type of action
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE, -- Nullable, used for likes and comments
    content TEXT, -- Nullable, used for truncating the actual comment text
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can see only their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Policy: Users can insert notifications for others (e.g. when liking a post)
CREATE POLICY "Users can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = actor_id);

-- 5. Policy: Users can update ONLY their own notifications (e.g. to mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
