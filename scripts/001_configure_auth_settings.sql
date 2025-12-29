-- Disable email confirmation requirement
-- Enable anonymous sign-ins
-- This script configures Supabase auth settings

-- Note: These settings are configured in the Supabase Dashboard under Authentication > Settings
-- You can run this to document the required configuration

-- Required settings in Supabase Dashboard:
-- 1. Authentication > Settings > Email Auth:
--    - Enable email confirmations: OFF
--    - Enable email change confirmations: OFF
--    
-- 2. Authentication > Settings > Auth Providers:
--    - Anonymous sign-ins: ON
--
-- 3. Site URL should be set to your app URL (already configured via environment variables)

-- Updated to handle both anonymous and email users properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      CASE 
        WHEN NEW.email IS NOT NULL THEN SPLIT_PART(NEW.email, '@', 1)
        ELSE 'Guest ' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
      END
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.user_settings TO anon, authenticated;
