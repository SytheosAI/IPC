-- Create helper function to get current user ID
-- This helps debug auth.uid() issues
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;

-- Create a diagnostic function to check auth state
CREATE OR REPLACE FUNCTION check_auth_state()
RETURNS json AS $$
DECLARE
  user_id uuid;
  user_role text;
  jwt_role text;
  jwt_email text;
  result json;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Get current role from auth.role()
  user_role := auth.role();
  
  -- Get JWT claims
  jwt_role := current_setting('request.jwt.claim.role', true);
  jwt_email := current_setting('request.jwt.claim.email', true);
  
  -- Build result JSON
  result := json_build_object(
    'user_id', user_id,
    'user_role', user_role,
    'jwt_role', jwt_role,
    'jwt_email', jwt_email,
    'is_authenticated', (user_id IS NOT NULL),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION check_auth_state() TO authenticated, anon;

-- Create a test function specifically for VBA projects
CREATE OR REPLACE FUNCTION test_vba_create_permission()
RETURNS json AS $$
DECLARE
  user_id uuid;
  can_create boolean;
  test_result json;
BEGIN
  -- Get current user
  user_id := auth.uid();
  
  -- Check if user can create (simplified check)
  can_create := (user_id IS NOT NULL);
  
  -- Build result
  test_result := json_build_object(
    'user_id', user_id,
    'can_create', can_create,
    'reason', CASE 
      WHEN user_id IS NULL THEN 'No authenticated user found'
      ELSE 'User is authenticated'
    END
  );
  
  RETURN test_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION test_vba_create_permission() TO authenticated, anon;