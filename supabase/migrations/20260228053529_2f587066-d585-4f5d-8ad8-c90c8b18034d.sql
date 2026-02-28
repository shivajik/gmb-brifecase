
-- Fix search_path on update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- The 3 "RLS enabled no policy" warnings are for cms_users, cms_sessions, cms_user_roles.
-- These are intentionally locked down (no anon access). Edge functions use service_role which bypasses RLS.
-- No additional policies needed for these tables.
