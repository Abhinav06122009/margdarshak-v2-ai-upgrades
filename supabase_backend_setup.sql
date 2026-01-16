-- Supabase Backend Setup for Advanced Security
-- Run this in your Supabase SQL Editor.

-- 1. PROFILES TABLE
-- This table stores user data linked to the auth.users table.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  email TEXT UNIQUE,
  full_name TEXT,
  user_type TEXT DEFAULT 'student',
  phone_number TEXT,
  country_code TEXT,
  security_settings JSONB -- Stores fingerprints, 2FA status, etc.
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to read their own profile.
CREATE POLICY "Allow individual user read access" 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- RLS Policy: Allow users to create their own profile.
CREATE POLICY "Allow individual user insert access" 
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policy: Allow users to update their own profile.
CREATE POLICY "Allow individual user update access" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Function to automatically update the 'updated_at' timestamp.
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function before an update.
CREATE TRIGGER on_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- 2. SECURITY EVENTS TABLE
-- This table logs critical security events for auditing and threat detection.

CREATE TABLE IF NOT EXISTS public.security_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  ip_address INET,
  device_fingerprint JSONB,
  data JSONB -- For any other relevant data
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Disallow all client-side access.
-- Security events should only be logged via a secure Edge Function using the service_role key.
CREATE POLICY "Disallow all client access" 
ON public.security_events
FOR ALL USING (false);

-- Note: If you want admins to be able to read logs, you would add a SELECT policy:
-- CREATE POLICY "Allow admin read access" ON public.security_events FOR SELECT
-- USING (get_my_claim('user_role') = 'admin'); -- Requires custom claims setup


-- 3. CSRF PROTECTION FUNCTION (for non-Supabase clients)
-- Supabase client handles this with JWTs, but if you have external forms,
-- this demonstrates a basic CSRF token pattern.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.get_csrf_token()
RETURNS TEXT AS $$
BEGIN
  RETURN extensions.gen_random_bytes(32)::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;


-- Final check to ensure RLS is on.
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('profiles', 'security_events');
