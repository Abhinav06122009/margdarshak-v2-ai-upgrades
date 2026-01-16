-- ====================================================================
-- SUPABASE ADVANCED SECURITY FUNCTIONS (PostgreSQL)
-- ====================================================================
-- This script contains the specific server-side RPC functions needed to 
-- support the advanced security features in AuthPage.tsx.
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
