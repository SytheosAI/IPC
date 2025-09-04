-- RESET ALL AUTH PERMISSIONS
-- This might fix the "Database error querying schema" issue

-- Grant all necessary permissions on auth schema
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- Specifically grant on auth.users
GRANT ALL ON TABLE auth.users TO postgres, service_role;
GRANT SELECT ON TABLE auth.users TO anon, authenticated;

-- Grant on other auth tables
GRANT ALL ON TABLE auth.identities TO postgres, service_role;
GRANT ALL ON TABLE auth.instances TO postgres, service_role;
GRANT ALL ON TABLE auth.sessions TO postgres, service_role;
GRANT ALL ON TABLE auth.refresh_tokens TO postgres, service_role;

-- Check the result
SELECT 'Permissions reset completed' as status;