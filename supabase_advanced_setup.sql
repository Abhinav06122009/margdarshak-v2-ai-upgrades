-- ====================================================================
-- SUPABASE ADVANCED SECURITY SETUP (PostgreSQL)
-- ====================================================================
-- This script provides a comprehensive backend setup for a secure application.
-- It includes tables, roles, role-based access control (RLS), and server-side functions.
-- Execute this entire script in your Supabase SQL Editor.
-- ====================================================================

-- --------------------------------------------------------------------
-- EXTENSIONS - Ensure required PostgreSQL extensions are enabled.
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ====================================================================
-- SECTION 1: USER PROFILES & ROLES
-- ====================================================================

-- --------------------------------------------------------------------
-- Table: user_roles
-- Purpose: Assigns a role (e.g., 'admin', 'user') to each user.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user'
);

COMMENT ON TABLE public.user_roles IS 'Stores the role for each user, enabling role-based access control.';

-- --------------------------------------------------------------------
-- Table: profiles
-- Purpose: Stores public user data, linked to auth.users.
-- --------------------------------------------------------------------
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

COMMENT ON TABLE public.profiles IS 'Stores public user data and security-related settings.';

-- ====================================================================
-- SECTION 2: SECURITY LOGGING
-- ====================================================================

-- --------------------------------------------------------------------
-- Table: security_events
-- Purpose: Logs critical security events for auditing and threat detection.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  ip_address INET,
  device_fingerprint JSONB,
  data JSONB -- For any other relevant data (e.g., anomalies detected)
);

COMMENT ON TABLE public.security_events IS 'Logs critical security events for auditing and automated threat detection.';

-- ====================================================================
-- SECTION 3: SERVER-SIDE FUNCTIONS (RPC)
-- ====================================================================

-- --------------------------------------------------------------------
-- Function: get_my_role
-- Purpose: Securely retrieves the role of the currently authenticated user.
-- Usage: Can be used in RLS policies to check permissions.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

-- --------------------------------------------------------------------
-- Function: handle_new_user
-- Purpose: A trigger function that automatically creates a profile and a user_role entry when a new user signs up.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to run with elevated privileges to insert into tables.
SET search_path = public
AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, email, full_name, user_type, phone_number, country_code, security_settings)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_type',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'country_code',
    NEW.raw_user_meta_data->'security_metadata' -- This is the initial fingerprint from the client
  );

  -- Assign a default role to the new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create a trigger that executes the function after a new user is added to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Triggered on new user signup to automatically provision their profile and role.';

-- ====================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- --------------------------------------------------------------------
-- Policies for: user_roles
-- --------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own role.
CREATE POLICY "Allow individual read access on user_roles" 
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can see all user roles.
CREATE POLICY "Allow admin read access on user_roles" 
ON public.user_roles FOR SELECT
USING (public.get_my_role() = 'admin');

-- --------------------------------------------------------------------
-- Policies for: profiles
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear out any existing old policies before creating new ones
DROP POLICY IF EXISTS "Allow individual user read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user insert access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual user update access" ON public.profiles;

-- Users can see their own profile.
CREATE POLICY "Allow individual read access on profiles" 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile.
CREATE POLICY "Allow individual update access on profiles" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can see all profiles.
CREATE POLICY "Allow admin read access on profiles" 
ON public.profiles FOR SELECT
USING (public.get_my_role() = 'admin');

-- --------------------------------------------------------------------
-- Policies for: security_events
-- --------------------------------------------------------------------
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Clear out any existing old policies
DROP POLICY IF EXISTS "Disallow all client access" ON public.security_events;

-- Disallow ALL direct client access. Events MUST be logged via the Edge Function.
CREATE POLICY "Disallow all direct client access on security_events" 
ON public.security_events
FOR ALL USING (false);

-- Allow admins to read all security events for auditing.
CREATE POLICY "Allow admin read access on security_events"
ON public.security_events FOR SELECT
USING (public.get_my_role() = 'admin');


-- ====================================================================
-- FINALIZATION
-- ====================================================================

-- Example of how to make a user an admin:
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = '[THE_USER_ID_TO_MAKE_ADMIN]';

PRINT 'Supabase advanced security setup is complete.';
-- ====================================================================
