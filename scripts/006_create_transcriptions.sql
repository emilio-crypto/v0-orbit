-- Create transcriptions table
CREATE TABLE IF NOT EXISTS public.transcriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  room_name TEXT NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT transcriptions_pkey PRIMARY KEY (id),
  CONSTRAINT transcriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS transcriptions_room_name_idx ON public.transcriptions(room_name);
CREATE INDEX IF NOT EXISTS transcriptions_user_id_idx ON public.transcriptions(user_id);

-- Enable RLS
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Transcriptions are viewable by room participants"
  ON public.transcriptions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create transcriptions"
  ON public.transcriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own transcriptions"
  ON public.transcriptions FOR UPDATE
  USING (auth.uid() = user_id);
