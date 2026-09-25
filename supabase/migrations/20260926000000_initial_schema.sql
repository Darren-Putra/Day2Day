-- ==============================================================================
-- Migration: 20260926000000_initial_schema.sql
-- Description: Initial schema for Day2Day College Management System
-- Tables: schedules, api_keys
-- Features: Row Level Security (RLS), recurrence support, API key management
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'IMPORTANT_URGENT',
            'IMPORTANT_NOT_URGENT',
            'NOT_IMPORTANT_URGENT',
            'NOT_IMPORTANT_NOT_URGENT'
        )
    ),
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    repeat_type TEXT NOT NULL DEFAULT 'none' CHECK (
        repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')
    ),
    repeat_config JSONB DEFAULT '{"interval": 1, "days": [], "until": null}'::jsonb,
    timezone TEXT NOT NULL DEFAULT 'Asia/Makassar',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_end_time_after_start CHECK (end_time > start_time)
);

-- Comments for documentation
COMMENT ON TABLE public.schedules IS 'Personal schedule activities with recurrence and Eisenhower matrix categories.';
COMMENT ON COLUMN public.schedules.repeat_config IS 'JSONB configuration for recurrence rule: interval, specific days of week, until date';

-- 2. API KEYS TABLE
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ
);

COMMENT ON TABLE public.api_keys IS 'Hashed API keys for external automation (e.g. Python scripts, AI agents). Plaintext is never stored.';

-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_schedules_user_start_date ON public.schedules(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_schedules_user_repeat ON public.schedules(user_id, repeat_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Schedules RLS Policies
DROP POLICY IF EXISTS "Users can view own schedules" ON public.schedules;
CREATE POLICY "Users can view own schedules"
    ON public.schedules FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own schedules" ON public.schedules;
CREATE POLICY "Users can create own schedules"
    ON public.schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedules" ON public.schedules;
CREATE POLICY "Users can update own schedules"
    ON public.schedules FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own schedules" ON public.schedules;
CREATE POLICY "Users can delete own schedules"
    ON public.schedules FOR DELETE
    USING (auth.uid() = user_id);

-- API Keys RLS Policies
DROP POLICY IF EXISTS "Users can view own api keys" ON public.api_keys;
CREATE POLICY "Users can view own api keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own api keys" ON public.api_keys;
CREATE POLICY "Users can create own api keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own api keys" ON public.api_keys;
CREATE POLICY "Users can update own api keys"
    ON public.api_keys FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own api keys" ON public.api_keys;
CREATE POLICY "Users can delete own api keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- 5. TRIGGER FOR AUTO-UPDATING updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_schedules_updated_at ON public.schedules;
CREATE TRIGGER trigger_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
