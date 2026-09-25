-- ==============================================================================
-- Migration: 20260926000001_assignments_schema.sql
-- Description: Assignments table with deadline tracking, status, and RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    course_name TEXT,
    due_date DATE NOT NULL,
    due_time TIME NOT NULL DEFAULT '23:59',
    estimated_duration_minutes INT NOT NULL DEFAULT 120,
    category TEXT NOT NULL CHECK (
        category IN (
            'IMPORTANT_URGENT',
            'IMPORTANT_NOT_URGENT',
            'NOT_IMPORTANT_URGENT',
            'NOT_IMPORTANT_NOT_URGENT'
        )
    ),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')
    ),
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.assignments IS 'College assignments and tasks with deadline tracking, estimated work duration, and status.';

-- Indexes for filtering by user, status, and due date
CREATE INDEX IF NOT EXISTS idx_assignments_user_status ON public.assignments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_user_due_date ON public.assignments(user_id, due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own assignments" ON public.assignments;
CREATE POLICY "Users can view own assignments"
    ON public.assignments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own assignments" ON public.assignments;
CREATE POLICY "Users can create own assignments"
    ON public.assignments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
CREATE POLICY "Users can update own assignments"
    ON public.assignments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;
CREATE POLICY "Users can delete own assignments"
    ON public.assignments FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trigger_assignments_updated_at ON public.assignments;
CREATE TRIGGER trigger_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
