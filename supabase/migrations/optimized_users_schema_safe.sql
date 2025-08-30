-- =====================================================
-- OPTIMIZED USER SCHEMA FOR 20,000+ USERS (SAFE VERSION)
-- Checks for existing objects before creating
-- =====================================================

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For exclusion constraints

-- =====================================================
-- DROP EXISTING OBJECTS SAFELY
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop existing profiles table and recreate
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop other tables if they exist
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS user_group_members CASCADE;
DROP TABLE IF EXISTS user_groups CASCADE;
DROP TABLE IF EXISTS user_audit_log CASCADE;
DROP TABLE IF EXISTS user_audit_log_archive CASCADE;
DROP TABLE IF EXISTS user_api_keys CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS active_users CASCADE;
DROP VIEW IF EXISTS user_statistics CASCADE;

-- =====================================================
-- USERS TABLE (Enhanced Profiles)
-- =====================================================
CREATE TABLE profiles (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic information (indexed for fast lookups)
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  
  -- Profile details
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Role and permissions (indexed for authorization checks)
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'inspector', 'supervisor', 'manager', 'admin', 'super_admin')),
  department TEXT,
  title TEXT,
  employee_id TEXT UNIQUE,
  license_number TEXT,
  license_type TEXT,
  license_expiry DATE,
  
  -- Company/Organization (indexed for multi-tenant queries)
  company_id UUID,
  company_name TEXT,
  branch_office TEXT,
  team_id UUID,
  
  -- Location data (indexed for geo queries)
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  timezone TEXT DEFAULT 'America/New_York',
  postal_code TEXT,
  
  -- Account settings
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  
  -- Metadata for analytics
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  
  -- User preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete support
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(email, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(company_name, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(department, '')), 'D')
  ) STORED
);

-- =====================================================
-- USER SESSIONS TABLE
-- =====================================================
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  device_id TEXT,
  location_city TEXT,
  location_country TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROLES AND PERMISSIONS
-- =====================================================
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- USER GROUPS
-- =====================================================
CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_group_id UUID REFERENCES user_groups(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE user_group_members (
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  PRIMARY KEY (group_id, user_id)
);

-- =====================================================
-- AUDIT LOG (Partitioned for performance)
-- =====================================================
CREATE TABLE user_audit_log (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE IF NOT EXISTS user_audit_log_2024_01 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_02 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_03 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_04 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_05 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_06 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_07 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_08 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_09 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_10 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_11 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2024_12 PARTITION OF user_audit_log
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
-- 2025 partitions
CREATE TABLE IF NOT EXISTS user_audit_log_2025_01 PARTITION OF user_audit_log
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2025_02 PARTITION OF user_audit_log
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2025_03 PARTITION OF user_audit_log
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2025_04 PARTITION OF user_audit_log
  FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2025_05 PARTITION OF user_audit_log
  FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS user_audit_log_2025_06 PARTITION OF user_audit_log
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- =====================================================
-- API KEYS
-- =====================================================
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION PREFERENCES
-- =====================================================
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'daily', 'weekly', 'never')),
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  
  -- Notification types
  project_updates BOOLEAN DEFAULT true,
  inspection_reminders BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  report_completions BOOLEAN DEFAULT true,
  team_mentions BOOLEAN DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HIGH-PERFORMANCE INDEXES
-- =====================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON profiles USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON profiles USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_role ON profiles(company_id, role) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_active_role ON profiles(is_active, role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_company_active ON profiles(company_id, is_active) WHERE company_id IS NOT NULL AND is_active = true;

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(search_vector);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = true;

-- Role indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_perms_role_id ON role_permissions(role_id);

-- Group indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON user_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON user_group_members(group_id);

-- API key indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON user_api_keys(key_prefix);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON user_audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON user_audit_log(resource_type, resource_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON user_api_keys;

-- Profile policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id OR is_active = true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Session policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- API key policies
CREATE POLICY "Users can manage their own API keys" ON user_api_keys
  FOR ALL USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_title TEXT;
BEGIN
  -- Extract name from email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Determine role and title based on email
  IF NEW.email = 'mparish@meridianswfl.com' THEN
    user_role := 'admin';
    user_title := 'Administrator';
  ELSE
    user_role := 'inspector';
    user_title := 'Inspector';
  END IF;
  
  -- Insert profile
  INSERT INTO profiles (
    user_id, 
    email, 
    name, 
    role, 
    title,
    first_name,
    last_name,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    user_title,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(user_name, ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(user_name, ' ', 2)),
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW();
  
  -- Create default notification preferences
  INSERT INTO notification_preferences (user_id)
  VALUES ((SELECT id FROM profiles WHERE user_id = NEW.id))
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update last activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_activity ON user_sessions;
CREATE TRIGGER update_user_activity
  AFTER INSERT OR UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_last_activity();

-- Audit log function
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    NEW.id,
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_profile_changes ON profiles;
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default roles (ON CONFLICT to handle existing)
INSERT INTO roles (name, display_name, description, priority, is_system) VALUES
  ('super_admin', 'Super Administrator', 'Full system access', 100, true),
  ('admin', 'Administrator', 'Administrative access', 90, true),
  ('manager', 'Manager', 'Management level access', 70, true),
  ('supervisor', 'Supervisor', 'Supervisory access', 60, true),
  ('inspector', 'Inspector', 'Standard inspector access', 50, true),
  ('user', 'User', 'Basic user access', 10, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (resource, action, description) VALUES
  ('users', 'create', 'Create new users'),
  ('users', 'read', 'View user information'),
  ('users', 'update', 'Update user information'),
  ('users', 'delete', 'Delete users'),
  ('projects', 'create', 'Create new projects'),
  ('projects', 'read', 'View projects'),
  ('projects', 'update', 'Update projects'),
  ('projects', 'delete', 'Delete projects'),
  ('reports', 'create', 'Create reports'),
  ('reports', 'read', 'View reports'),
  ('reports', 'update', 'Update reports'),
  ('reports', 'delete', 'Delete reports'),
  ('inspections', 'create', 'Create inspections'),
  ('inspections', 'read', 'View inspections'),
  ('inspections', 'update', 'Update inspections'),
  ('inspections', 'delete', 'Delete inspections'),
  ('settings', 'manage', 'Manage system settings'),
  ('analytics', 'view', 'View analytics'),
  ('audit', 'view', 'View audit logs')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign permissions to roles (only if not already assigned)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('admin', 'super_admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- MONITORING VIEWS
-- =====================================================

-- Active users view
CREATE OR REPLACE VIEW active_users AS
SELECT 
  p.*,
  s.last_activity_at as session_activity,
  s.device_type,
  s.ip_address
FROM profiles p
LEFT JOIN LATERAL (
  SELECT * FROM user_sessions
  WHERE user_id = p.id
    AND is_active = true
    AND expires_at > NOW()
  ORDER BY last_activity_at DESC
  LIMIT 1
) s ON true
WHERE p.is_active = true
  AND p.deleted_at IS NULL;

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '1 day') as daily_active_users,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '7 days') as weekly_active_users,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '30 days') as monthly_active_users,
  COUNT(DISTINCT company_id) as total_companies,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE role = 'inspector') as inspector_count,
  COUNT(*) as total_users
FROM profiles
WHERE deleted_at IS NULL;

-- =====================================================
-- MAINTENANCE PROCEDURES
-- =====================================================

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Create archive table if it doesn't exist
  CREATE TABLE IF NOT EXISTS user_audit_log_archive (
    id UUID,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
  );
  
  -- Move logs older than 90 days to archive table
  INSERT INTO user_audit_log_archive (id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, metadata, created_at)
  SELECT id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, metadata, created_at
  FROM user_audit_log
  WHERE created_at < NOW() - INTERVAL '90 days'
  ON CONFLICT (id, created_at) DO NOTHING;
  
  -- Delete archived logs from main table
  DELETE FROM user_audit_log
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS FOR SUPABASE
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- FINAL ANALYTICS
-- =====================================================
ANALYZE profiles;
ANALYZE user_sessions;
ANALYZE user_roles;