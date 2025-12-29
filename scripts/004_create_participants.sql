-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL,
  user_id UUID,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'attendee'::text,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'online'::text,
  CONSTRAINT participants_pkey PRIMARY KEY (id),
  CONSTRAINT participants_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE,
  CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS participants_meeting_id_idx ON public.participants(meeting_id);
CREATE INDEX IF NOT EXISTS participants_user_id_idx ON public.participants(user_id);

-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Participants are viewable by everyone"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join meetings"
  ON public.participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participant record"
  ON public.participants FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT host_id FROM public.meetings WHERE id = meeting_id
  ));

CREATE POLICY "Users can delete their own participant record"
  ON public.participants FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT host_id FROM public.meetings WHERE id = meeting_id
  ));
