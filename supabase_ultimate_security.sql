-- ====================================================================
-- SUPABASE ULTIMATE SECURITY SCRIPT (PostgreSQL)
-- ====================================================================
-- This script centralizes all advanced security logic (trust scoring, anomaly detection)
-- into secure, server-side PostgreSQL functions, replacing client-side simulations.
-- Execute this entire script in your Supabase SQL Editor.
-- ====================================================================

-- Drop existing functions to ensure a clean setup
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ====================================================================
-- SECTION 1: CORE SCHEMA (Profiles, Roles, Events)
-- This section is idempotent and ensures the core tables exist.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  email TEXT UNIQUE,
  full_name TEXT,
  user_type TEXT DEFAULT 'student',
  phone_number TEXT,
  country_code TEXT,
  security_settings JSONB
);

CREATE TABLE IF NOT EXISTS public.security_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  ip_address INET,
  device_fingerprint JSONB,
  data JSONB
);

-- ====================================================================
-- SECTION 2: SERVER-SIDE SECURITY FUNCTIONS
-- These functions contain the core security logic, moved from the client.
-- ====================================================================

-- --------------------------------------------------------------------
-- Function: fn_calculate_trust_score(fingerprint JSONB)
-- Purpose: Calculates a device trust score based on fingerprint data.
-- This logic is now secure on the server.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_calculate_trust_score(fingerprint JSONB)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  score INT := 100;
  user_agent TEXT := fingerprint->>'userAgent';
  webgl_info TEXT := fingerprint->>'webgl';
BEGIN
  -- Penalize for signs of automation or privacy-hiding tools
  IF user_agent ILIKE '%Headless%' OR user_agent ILIKE '%Tor%' THEN
    score := score - 50;
  END IF;

  IF fingerprint->>'webdriver' = 'true' THEN
    score := score - 50;
  END IF;

  -- Penalize for missing advanced fingerprinting data
  IF webgl_info = 'no_webgl' OR webgl_info = 'webgl_error' THEN
    score := score - 20;
  END IF;

  IF fingerprint->>'audio' = 'no_audio_context' OR fingerprint->>'audio' = 'audio_context_error' THEN
    score := score - 15;
  END IF;

  RETURN GREATEST(0, LEAST(100, score));
END;
$$;

COMMENT ON FUNCTION public.fn_calculate_trust_score IS 'Calculates a device trust score based on fingerprint data, now secured on the server.';

-- --------------------------------------------------------------------
-- Function: fn_check_login_anomalies(p_user_id UUID, new_fingerprint JSONB)
-- Purpose: Compares a new fingerprint against the last known one and logs anomalies.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_check_login_anomalies(p_user_id UUID, new_fingerprint JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Required to read profiles and write to security_events
SET search_path = public
AS $$
DECLARE
  last_fingerprint JSONB;
  anomalies JSONB := '[]'::jsonb;
BEGIN
  -- Get the most recent fingerprint from the user's profile
  SELECT security_settings->'device_fingerprints'->0 INTO last_fingerprint
  FROM public.profiles
  WHERE id = p_user_id;

  IF last_fingerprint IS NULL THEN
    RETURN anomalies;
  END IF;

  -- Compare attributes and build a JSON array of anomalies
  IF new_fingerprint->>'timezone' <> last_fingerprint->>'timezone' THEN
    anomalies := anomalies || jsonb_build_object('type', 'Timezone Change', 'from', last_fingerprint->>'timezone', 'to', new_fingerprint->>'timezone');
  END IF;

  IF new_fingerprint->>'language' <> last_fingerprint->>'language' THEN
    anomalies := anomalies || jsonb_build_object('type', 'Language Change', 'from', last_fingerprint->>'language', 'to', new_fingerprint->>'language');
  END IF;

  IF new_fingerprint->>'platform' <> last_fingerprint->>'platform' THEN
    anomalies := anomalies || jsonb_build_object('type', 'Platform Change', 'from', last_fingerprint->>'platform', 'to', new_fingerprint->>'platform');
  END IF;

  -- If anomalies were found, log a single event
  IF jsonb_array_length(anomalies) > 0 THEN
    INSERT INTO public.security_events (user_id, event, device_fingerprint, data)
    VALUES (p_user_id, 'login_anomaly_detected', new_fingerprint, jsonb_build_object('anomalies', anomalies));
  END IF;

  RETURN anomalies;
END;
$$;

COMMENT ON FUNCTION public.fn_check_login_anomalies IS 'Compares new login fingerprint with the last known one and logs detected anomalies.';

-- ====================================================================
-- SECTION 3: PRIMARY RPC ENDPOINT
-- ====================================================================

-- --------------------------------------------------------------------
-- Function: handle_secure_login(new_fingerprint JSONB)
-- Purpose: The single, secure endpoint your client calls after authentication.
-- It orchestrates all server-side security checks.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_secure_login(new_fingerprint JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Required to perform privileged operations
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  trust_score INT;
  anomalies JSONB;
  current_settings JSONB;
  new_fingerprints JSONB;
BEGIN
  -- 1. Calculate Trust Score
  trust_score := public.fn_calculate_trust_score(new_fingerprint);

  -- 2. Check for Anomalies
  anomalies := public.fn_check_login_anomalies(current_user_id, new_fingerprint);

  -- 3. Update the user's fingerprint history
  SELECT security_settings INTO current_settings FROM public.profiles WHERE id = current_user_id;
  
  -- Prepend the new fingerprint and keep the last 5 for history
  new_fingerprints := jsonb_build_array(new_fingerprint) || (COALESCE(current_settings->'device_fingerprints', '[]'::jsonb));
  IF jsonb_array_length(new_fingerprints) > 5 THEN
    new_fingerprints := new_fingerprints[0:4]; -- Keep the 5 most recent
  END IF;

  UPDATE public.profiles
  SET security_settings = jsonb_set(
    COALESCE(current_settings, '{}'::jsonb),
    '{device_fingerprints}',
    new_fingerprints
  )
  WHERE id = current_user_id;

  -- 4. Return the results to the client
  RETURN jsonb_build_object(
    'trust_score', trust_score,
    'anomalies_detected', anomalies
  );
END;
$$;

COMMENT ON FUNCTION public.handle_secure_login IS 'Orchestrates all server-side security checks on user login. Call this via RPC from the client.';

-- ====================================================================
-- SECTION 4: AUTH TRIGGER & RLS POLICIES
-- ====================================================================

-- --------------------------------------------------------------------
-- Function: handle_new_user (Trigger)
-- Purpose: Sets up a new user's profile and role on signup.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
    jsonb_build_object(
      'device_fingerprints', jsonb_build_array(NEW.raw_user_meta_data->'security_metadata'),
      'initial_trust_score', public.fn_calculate_trust_score(NEW.raw_user_meta_data->'security_metadata')
    )
  );

  -- Assign a default role to the new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- --------------------------------------------------------------------
-- RLS Policies (Ensuring security is enabled and configured)
-- --------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Define policies
DROP POLICY IF EXISTS "Allow individual read access on user_roles" ON public.user_roles;
CREATE POLICY "Allow individual read access on user_roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow admin read access on user_roles" ON public.user_roles;
CREATE POLICY "Allow admin read access on user_roles" ON public.user_roles FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Allow individual read access on profiles" ON public.profiles;
CREATE POLICY "Allow individual read access on profiles" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual update access on profiles" ON public.profiles;
CREATE POLICY "Allow individual update access on profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admin read access on profiles" ON public.profiles;
CREATE POLICY "Allow admin read access on profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Disallow all direct client access on security_events" ON public.security_events;
CREATE POLICY "Disallow all direct client access on security_events" ON public.security_events FOR ALL USING (false);

DROP POLICY IF EXISTS "Allow admin read access on security_events" ON public.security_events;
CREATE POLICY "Allow admin read access on security_events" ON public.security_events FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ====================================================================
-- HOW TO USE FROM YOUR CLIENT (e.g., AuthPage.tsx)
-- ====================================================================
--
-- After a user successfully signs in with email/password or OAuth:
--
--   const fingerprint = await securityFeatures.generateDeviceFingerprint();
--   const { data, error } = await supabase.rpc('handle_secure_login', {
--     new_fingerprint: fingerprint
--   });
--
--   if (error) {
--     console.error('Secure login check failed:', error);
--   } else {
--     console.log('Server-side security check results:', data);
--     // data.trust_score contains the score
--     // data.anomalies_detected is a list of anomalies
--     // You can now update the UI with this secure, server-validated data.
--   }
--
-- ====================================================================

PRINT 'Supabase ULTIMATE security script deployed successfully.';
