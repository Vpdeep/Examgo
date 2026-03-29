-- Run this migration in the Supabase SQL editor (or via CLI) before relying on RLS + auth.
-- Requires SUPABASE_SERVICE_ROLE_KEY on the server for registration, OTP, and admin APIs.

-- OTP send rate limiting (max entries counted per phone per hour in application code)
CREATE TABLE IF NOT EXISTS public.otp_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_send_log_phone_created
  ON public.otp_send_log (phone, created_at DESC);

ALTER TABLE public.otp_send_log ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; block direct anon/authenticated access to logs
COMMENT ON TABLE public.otp_send_log IS 'OTP request audit trail; app inserts via service role only.';

-- App expects boolean is_verified for admin-approved students (dashboard / admin panel).
-- If your project still uses a legacy "verified" column only, add is_verified or rename accordingly.

-- Student auth linkage (Supabase Auth user id)
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;

-- Optional: link redemptions to students for stricter policies later
ALTER TABLE public.redemptions
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students (id) ON DELETE SET NULL;

-- Row Level Security: students see/update only their own row when authenticated
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS students_select_own ON public.students;
CREATE POLICY students_select_own ON public.students
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS students_update_own ON public.students;
CREATE POLICY students_update_own ON public.students
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- scholar_leads: left without RLS here so institution portals (phone login + anon key) keep working.
-- Tighten later with Supabase Auth for institutions or server-only APIs.

-- OTP rows: no client access; only service role (used from API routes)
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Storage: in Dashboard → Storage → admit-cards, add policies so authenticated users can upload/read
-- objects where the first path segment matches their students.id (if you use paths like {student_id}.pdf).
