-- Enable uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  host_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT meetings_pkey PRIMARY KEY (id),
  CONSTRAINT meetings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS meetings_code_idx ON public.meetings(code);

-- Create index on host_id
CREATE INDEX IF NOT EXISTS meetings_host_id_idx ON public.meetings(host_id);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Meetings are viewable by everyone"
  ON public.meetings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Hosts can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own meetings"
  ON public.meetings FOR DELETE
  USING (auth.uid() = host_id);
