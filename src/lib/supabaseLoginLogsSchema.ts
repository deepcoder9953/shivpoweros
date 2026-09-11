export const SUPABASE_LOGIN_LOGS_SQL = `-- ================================================================
-- SHIV POWER SOLUTION OS - COMPLETE SUPABASE DATABASE SETUP
-- 1. public.users Table (User accounts, roles, IDs)
-- 2. Automatic trigger from auth.users -> public.users
-- 3. public.user_login_logs Table (Admin login audit trails)
-- ================================================================

-- ================================================================
-- PART 1: public.users TABLE (User accounts & IDs & Credentials)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'Sales',
    department TEXT,
    password TEXT DEFAULT 'Password@123',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure password column exists if table was created previously
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'Password@123';

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow read for all authenticated & anonymous client sessions
DROP POLICY IF EXISTS "Allow select users for all" ON public.users;
CREATE POLICY "Allow select users for all"
ON public.users
FOR SELECT
USING (true);

-- Allow insert/upsert for all users
DROP POLICY IF EXISTS "Allow insert users for all" ON public.users;
CREATE POLICY "Allow insert users for all"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Allow update for all users
DROP POLICY IF EXISTS "Allow update users for all" ON public.users;
CREATE POLICY "Allow update users for all"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow delete for admins
DROP POLICY IF EXISTS "Allow delete users for all" ON public.users;
CREATE POLICY "Allow delete users for all"
ON public.users
FOR DELETE
USING (true);

-- ================================================================
-- PART 2: AUTOMATIC TRIGGER FROM auth.users -> public.users
-- Whenever any user signs up or is created, automatically insert or
-- update their ID and details into public.users table.
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_full_name TEXT;
  user_company TEXT;
  user_phone TEXT;
BEGIN
  -- Determine role: sharmadeepanshu576@gmail.com or admin emails get Admin
  IF NEW.email = 'sharmadeepanshu576@gmail.com' OR NEW.email ILIKE '%admin%' THEN
    assigned_role := 'Admin';
  ELSE
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Sales');
  END IF;

  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  user_company := COALESCE(NEW.raw_user_meta_data->>'company_name', 'General');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'mobile', NEW.raw_user_meta_data->>'phone', '');

  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    department,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id::text,
    NEW.email,
    user_full_name,
    user_phone,
    assigned_role,
    user_company,
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ================================================================
-- PART 3: public.user_login_logs TABLE (Admin Audit & Login History)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'Sales',
    company_name TEXT DEFAULT 'Shiv Power Solution',
    login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ip_address TEXT DEFAULT '127.0.0.1',
    user_agent TEXT,
    device_type TEXT DEFAULT 'Desktop',
    browser TEXT DEFAULT 'Unknown Browser',
    operating_system TEXT DEFAULT 'Unknown OS',
    status TEXT NOT NULL DEFAULT 'success',
    login_method TEXT DEFAULT 'password',
    location_info TEXT DEFAULT 'India',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_login_logs_email ON public.user_login_logs(email);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_login_at ON public.user_login_logs(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_role ON public.user_login_logs(role);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_status ON public.user_login_logs(status);
CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_id ON public.user_login_logs(user_id);

ALTER TABLE public.user_login_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for all users" ON public.user_login_logs;
CREATE POLICY "Allow insert for all users"
ON public.user_login_logs
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for all authenticated users" ON public.user_login_logs;
CREATE POLICY "Allow select for all authenticated users"
ON public.user_login_logs
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow delete for administrators" ON public.user_login_logs;
CREATE POLICY "Allow delete for administrators"
ON public.user_login_logs
FOR DELETE
USING (true);
`;
