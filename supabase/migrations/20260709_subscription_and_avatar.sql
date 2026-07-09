-- 1. ADD NEW COLUMNS TO THE PROFILES TABLE
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{"gender": "neutral","skin_tone": "#E0A899","hair_style": "default","hair_color": "#2C1A14","outfit_id": "casual_01","accessory_id": "none"}'::jsonb;

-- 2. ADD VALIDATION CONSTRAINTS FOR THE NEW SUBSCRIPTION STATES
ALTER TABLE public.profiles
ADD CONSTRAINT check_subscription_status
CHECK (subscription_status IN ('TRIAL', 'PREMIUM', 'EXPIRED'));

-- 3. AUTOMATE EXPIRED TRIAL PROTECTION (SECURE THE PKR 5,000 PREMIUM GATE)
-- This function runs inside Postgres to automatically flag profiles as EXPIRED if their dates pass
CREATE OR REPLACE FUNCTION public.enforce_subscription_limits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_status = 'TRIAL' AND NOW() > NEW.subscription_ends_at THEN
        NEW.subscription_status := 'EXPIRED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_profile_expiration_on_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_subscription_limits();

-- 4. UPDATE INTERIM LOGS TO CAPTURE DURATION METRICS
ALTER TABLE public.translation_logs
ADD COLUMN IF NOT EXISTS session_duration_seconds INT DEFAULT 0;
