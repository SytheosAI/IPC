-- Add all missing tables for complete IPC functionality

-- Members table (for team members page)
CREATE TABLE public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  title TEXT,
  department TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  avatar_url TEXT,
  hire_date DATE,
  last_login TIMESTAMP WITH TIME ZONE,
  permissions TEXT[],
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Messages table
CREATE TABLE public.member_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id),
  sender_id UUID REFERENCES public.profiles(id),
  subject TEXT,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events table (enhanced)
DROP TABLE IF EXISTS public.security_events;
CREATE TABLE public.security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.profiles(id),
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  country TEXT,
  device_info JSONB,
  threat_detected BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Login Attempts table (for security monitoring)
CREATE TABLE public.login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT,
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  country TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Usage Log table
CREATE TABLE public.api_usage_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  ip_address INET,
  user_agent TEXT,
  request_size INTEGER,
  response_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Metrics table
CREATE TABLE public.system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_unit TEXT,
  category TEXT,
  tags JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Scans table
CREATE TABLE public.security_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scan_type TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  vulnerabilities_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  high_issues INTEGER DEFAULT 0,
  medium_issues INTEGER DEFAULT 0,
  low_issues INTEGER DEFAULT 0,
  scan_results JSONB,
  started_by UUID REFERENCES public.profiles(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Backup History table
CREATE TABLE public.backup_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  backup_type TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  status TEXT CHECK (status IN ('started', 'completed', 'failed')),
  error_message TEXT,
  records_backed_up INTEGER,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Architecture Analysis table
CREATE TABLE public.architecture_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  file_count INTEGER,
  component_count INTEGER,
  total_lines INTEGER,
  complexity_score DECIMAL,
  security_score DECIMAL,
  performance_score DECIMAL,
  maintainability_score DECIMAL,
  test_coverage DECIMAL,
  bundle_size INTEGER,
  issues_found INTEGER,
  critical_issues INTEGER,
  opportunities INTEGER,
  analysis_results JSONB,
  started_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Quality Issues table
CREATE TABLE public.code_quality_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_id UUID REFERENCES public.architecture_analysis(id),
  file_path TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  line_number INTEGER,
  column_number INTEGER,
  rule_id TEXT,
  suggested_fix TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics table
CREATE TABLE public.performance_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_url TEXT,
  load_time INTEGER,
  first_paint INTEGER,
  largest_contentful_paint INTEGER,
  cumulative_layout_shift DECIMAL,
  first_input_delay INTEGER,
  user_id UUID REFERENCES public.profiles(id),
  device_type TEXT,
  connection_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather Data table (for VBA page weather integration)
CREATE TABLE public.weather_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  temperature DECIMAL,
  humidity INTEGER,
  wind_speed DECIMAL,
  wind_direction INTEGER,
  conditions TEXT,
  forecast_data JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_quality_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view members in their organization" ON public.members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT tm.user_id FROM public.team_members tm 
      WHERE tm.organization_id = members.organization_id
    ) OR auth.uid() = created_by
  );

CREATE POLICY "Users can view their messages" ON public.member_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() IN (
      SELECT m.id FROM public.members m 
      WHERE m.id = member_messages.member_id
    )
  );

CREATE POLICY "Admins can view all security events" ON public.security_events
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin' OR email = 'mparish@meridianswfl.com'
    )
  );

CREATE POLICY "Users can view their login attempts" ON public.login_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view API usage" ON public.api_usage_log
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin' OR email = 'mparish@meridianswfl.com'
    )
  );

CREATE POLICY "Admins can view system metrics" ON public.system_metrics
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin' OR email = 'mparish@meridianswfl.com'
    )
  );

CREATE POLICY "Users can view security scans" ON public.security_scans
  FOR SELECT USING (auth.uid() = started_by);

CREATE POLICY "Users can view backup history" ON public.backup_history
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view architecture analysis" ON public.architecture_analysis
  FOR SELECT USING (auth.uid() = started_by);

CREATE POLICY "Weather data is publicly readable" ON public.weather_data
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_members_organization_id ON public.members(organization_id);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_member_messages_member_id ON public.member_messages(member_id);
CREATE INDEX idx_member_messages_created_at ON public.member_messages(created_at);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at);
CREATE INDEX idx_api_usage_log_created_at ON public.api_usage_log(created_at);
CREATE INDEX idx_system_metrics_created_at ON public.system_metrics(recorded_at);
CREATE INDEX idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX idx_performance_metrics_page ON public.performance_metrics(page_url);
CREATE INDEX idx_weather_data_location ON public.weather_data(location);
CREATE INDEX idx_weather_data_recorded_at ON public.weather_data(recorded_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON public.members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial security events for demo
INSERT INTO public.security_events (event_type, severity, title, description, ip_address, location) VALUES
('login', 'low', 'Successful Login', 'User logged in successfully', '192.168.1.100', 'Fort Myers, FL'),
('access', 'medium', 'Unauthorized Access Attempt', 'Failed attempt to access admin panel', '192.168.1.200', 'Unknown'),
('system', 'high', 'Database Connection Warning', 'High connection count detected', '127.0.0.1', 'Server'),
('threat', 'critical', 'SQL Injection Attempt', 'Malicious SQL detected in request', '10.0.0.50', 'External');

-- Insert initial system metrics
INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, category) VALUES
('cpu_usage', 65.5, 'percentage', 'system'),
('memory_usage', 78.2, 'percentage', 'system'),
('disk_usage', 45.0, 'percentage', 'system'),
('active_connections', 127, 'count', 'database'),
('response_time', 250, 'milliseconds', 'performance'),
('error_rate', 2.1, 'percentage', 'performance');