-- Run this in Supabase Dashboard > SQL Editor
-- Creates a function that bypasses RLS to delete test data

CREATE OR REPLACE FUNCTION public.delete_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM attendance WHERE full_name ILIKE '%test%' OR full_name ILIKE '%demo%' OR mobile = '5551234567';
  DELETE FROM registrations WHERE student_id IN (SELECT id FROM students WHERE full_name ILIKE '%test%' OR email ILIKE '%test%');
  DELETE FROM students WHERE full_name ILIKE '%test%' OR email ILIKE '%test%';
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION public.delete_test_data() TO anon;
GRANT EXECUTE ON FUNCTION public.delete_test_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_test_data() TO service_role;
