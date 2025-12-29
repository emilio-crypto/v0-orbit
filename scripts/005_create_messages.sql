-- Create messages table for meeting chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL,
  sender_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  type TEXT DEFAULT 'text'::text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create index on meeting_id for fast message retrieval
CREATE INDEX IF NOT EXISTS messages_meeting_id_idx ON public.messages(meeting_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Messages are viewable by everyone"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);
