-- IPC (Inspections & Permit Control) Database Schema
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'inspector',
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    last_seen TIMESTAMPTZ,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS & PERMITS
-- =============================================

-- Projects table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_number TEXT UNIQUE,
    project_name TEXT NOT NULL,
    address TEXT NOT NULL,
    owner TEXT,
    contractor TEXT,
    project_type TEXT,
    category TEXT CHECK (category IN ('commercial', 'residential', 'industrial')),
    start_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permits table
CREATE TABLE public.permits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    permit_number TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    applicant TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'issued')),
    submitted_date TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    assigned_to UUID REFERENCES public.users(id),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submittals table  
CREATE TABLE public.submittals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submittal_number TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_address TEXT NOT NULL,
    applicant TEXT NOT NULL,
    contractor TEXT,
    type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('commercial', 'residential', 'industrial')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revisions_required')),
    date_submitted TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    reviewer UUID REFERENCES public.users(id),
    completeness INTEGER DEFAULT 0 CHECK (completeness >= 0 AND completeness <= 100),
    documents_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VBA INSPECTIONS
-- =============================================

-- Inspections table
CREATE TABLE public.inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    inspection_type TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    inspector_id UUID REFERENCES public.users(id),
    completion_rate INTEGER DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    virtual_inspector_enabled BOOLEAN DEFAULT false,
    ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
    photo_count INTEGER DEFAULT 0,
    violations INTEGER DEFAULT 0,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    selected_inspections TEXT[], -- Array of inspection types
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Checklist Items
CREATE TABLE public.checklist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pass', 'fail', 'na')),
    notes TEXT,
    photo_count INTEGER DEFAULT 0,
    voice_note_count INTEGER DEFAULT 0,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FILES & DOCUMENTS
-- =============================================

-- Files table
CREATE TABLE public.files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
    folder_type TEXT DEFAULT 'miscellaneous' CHECK (folder_type IN ('inspections', 'reports', 'templates', 'miscellaneous', 'photo-documentation')),
    name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'file' or 'folder'
    size_bytes BIGINT,
    file_path TEXT,
    mime_type TEXT,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES public.users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================
-- COLLABORATION & MESSAGING
-- =============================================

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'annotation', 'voice')),
    attachments JSONB DEFAULT '[]'::jsonb,
    read_status BOOLEAN DEFAULT false,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table (for submittals, inspections, etc.)
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    commentable_type TEXT NOT NULL, -- 'submittal', 'inspection', 'project'
    commentable_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CALENDAR & EVENTS
-- =============================================

-- Events table (for calendar scheduling)
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES public.users(id),
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACTIVITY & AUDIT LOGS
-- =============================================

-- Activities table (for audit trail and notifications)
CREATE TABLE public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    activity_type TEXT NOT NULL, -- 'vba', 'permit', 'inspection', 'comment', etc.
    sub_type TEXT, -- 'inspection_complete', 'issue_found', 'photo_uploaded', etc.
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- VBA Data Events (for real-time sync)
CREATE TABLE public.vba_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('inspection_complete', 'issue_found', 'photo_uploaded', 'checkin', 'signature')),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);

-- Projects indexes
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_category ON public.projects(category);

-- Permits indexes
CREATE INDEX idx_permits_status ON public.permits(status);
CREATE INDEX idx_permits_project_id ON public.permits(project_id);
CREATE INDEX idx_permits_assigned_to ON public.permits(assigned_to);

-- Submittals indexes
CREATE INDEX idx_submittals_status ON public.submittals(status);
CREATE INDEX idx_submittals_category ON public.submittals(category);
CREATE INDEX idx_submittals_reviewer ON public.submittals(reviewer);
CREATE INDEX idx_submittals_project_id ON public.submittals(project_id);

-- Inspections indexes
CREATE INDEX idx_inspections_status ON public.inspections(status);
CREATE INDEX idx_inspections_project_id ON public.inspections(project_id);
CREATE INDEX idx_inspections_inspector_id ON public.inspections(inspector_id);
CREATE INDEX idx_inspections_scheduled_date ON public.inspections(scheduled_date);

-- Files indexes
CREATE INDEX idx_files_project_id ON public.files(project_id);
CREATE INDEX idx_files_inspection_id ON public.files(inspection_id);
CREATE INDEX idx_files_folder_type ON public.files(folder_type);

-- Messages indexes
CREATE INDEX idx_messages_project_id ON public.messages(project_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);

-- Activities indexes
CREATE INDEX idx_activities_project_id ON public.activities(project_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_type ON public.activities(activity_type);
CREATE INDEX idx_activities_timestamp ON public.activities(timestamp);

-- Events indexes
CREATE INDEX idx_events_project_id ON public.events(project_id);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_status ON public.events(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vba_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
-- Users can see all users (for collaboration)
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Projects are visible to all authenticated users
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update projects they created" ON public.projects FOR UPDATE USING (auth.uid() = created_by);

-- Permits follow project permissions
CREATE POLICY "Anyone can view permits" ON public.permits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create permits" ON public.permits FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Similar policies for other tables...
CREATE POLICY "Anyone can view submittals" ON public.submittals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view inspections" ON public.inspections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view files" ON public.files FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view messages" ON public.messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_permits_updated_at BEFORE UPDATE ON public.permits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_submittals_updated_at BEFORE UPDATE ON public.submittals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default inspection types
CREATE TABLE public.inspection_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0
);

INSERT INTO public.inspection_types (name, category, description) VALUES
('Pre Construction', 'Planning', 'Initial site assessment before construction begins'),
('Permit Review', 'Planning', 'Review of permit applications and documentation'),
('Site Survey', 'Planning', 'Detailed survey of construction site'),
('Demolition', 'Structural', 'Inspection during demolition activities'),
('Silt Fence', 'Environmental', 'Erosion control measures inspection'),
('UG Plumbing', 'Plumbing', 'Underground plumbing installation'),
('UG Electrical', 'Electrical', 'Underground electrical installation'),
('UG Gas', 'Gas', 'Underground gas line installation'),
('Compaction', 'Structural', 'Soil compaction testing'),
('Termite Pre-Treatment', 'Pest Control', 'Pre-construction termite treatment'),
('Footings', 'Structural', 'Foundation footing inspection'),
('Slab', 'Structural', 'Concrete slab inspection'),
('Stem Wall', 'Structural', 'Stem wall construction inspection'),
('Pos-Tension', 'Structural', 'Post-tensioned concrete inspection'),
('Mono Slab', 'Structural', 'Monolithic slab inspection'),
('Column', 'Structural', 'Column installation inspection'),
('Tie Beam', 'Structural', 'Tie beam construction inspection'),
('Lintel', 'Structural', 'Lintel installation inspection'),
('Elevated Slab', 'Structural', 'Elevated slab construction inspection'),
('Truss/Framing', 'Structural', 'Roof truss and framing inspection'),
('Framing', 'Structural', 'General framing inspection'),
('Sheathing Nailing', 'Structural', 'Sheathing and nailing pattern inspection'),
('Strapping/Hardware', 'Structural', 'Metal strapping and hardware inspection'),
('Wind Mitigation', 'Structural', 'Wind resistance features inspection'),
('Window Bucks', 'Building Envelope', 'Window frame installation inspection'),
('Waterproofing', 'Building Envelope', 'Waterproofing system inspection'),
('Window Installation', 'Building Envelope', 'Window installation inspection'),
('Door Installation', 'Building Envelope', 'Door installation inspection'),
('Door/Window Flashing', 'Building Envelope', 'Flashing around openings inspection'),
('Roofing Dry-In', 'Roofing', 'Roof deck and underlayment inspection'),
('Roofing Nailer', 'Roofing', 'Roof nailer inspection'),
('Roofing Final', 'Roofing', 'Final roofing system inspection'),
('Stucco Lathe', 'Exterior', 'Stucco lathe installation inspection'),
('Rough Electrical', 'Electrical', 'Rough electrical installation inspection'),
('Rough Plumbing', 'Plumbing', 'Rough plumbing installation inspection'),
('Rough Low Voltage/Security', 'Electrical', 'Low voltage and security system rough-in'),
('Rough HVAC', 'HVAC', 'HVAC rough installation inspection'),
('Water Meter(Utility)', 'Plumbing', 'Water meter installation inspection'),
('Duct Pressure Test', 'HVAC', 'HVAC duct pressure testing'),
('Fireplace', 'Fire Safety', 'Fireplace installation inspection'),
('Wall Insulation', 'Insulation', 'Wall insulation inspection'),
('Attic Insulation', 'Insulation', 'Attic insulation inspection'),
('Sound Insulation(STC)', 'Insulation', 'Sound transmission class insulation'),
('Fire-Penetration', 'Fire Safety', 'Fire-rated penetration inspection'),
('Drywall Screw Pattern', 'Interior', 'Drywall screw pattern inspection'),
('Drywall', 'Interior', 'Drywall installation inspection'),
('Final Electrical', 'Electrical', 'Final electrical system inspection'),
('Final Plumbing', 'Plumbing', 'Final plumbing system inspection'),
('Final HVAC', 'HVAC', 'Final HVAC system inspection'),
('Final Low Voltage', 'Electrical', 'Final low voltage system inspection'),
('Back-Flow Preventer', 'Plumbing', 'Backflow prevention device inspection'),
('Duct Blaster Test', 'HVAC', 'HVAC duct blaster testing'),
('Fire Sprinkler', 'Fire Safety', 'Fire sprinkler system inspection'),
('Fire Alarm', 'Fire Safety', 'Fire alarm system inspection'),
('Grading/Drainage', 'Site Work', 'Site grading and drainage inspection'),
('Elevator', 'Mechanical', 'Elevator installation inspection'),
('Meter Equipment', 'Electrical', 'Electrical meter equipment inspection'),
('Transfer Switch', 'Electrical', 'Transfer switch installation inspection'),
('Storm Shutters', 'Building Envelope', 'Storm shutter installation inspection'),
('Fence', 'Site Work', 'Fencing installation inspection'),
('Accessibility', 'Accessibility', 'ADA compliance inspection'),
('Handrails', 'Safety', 'Handrail installation inspection'),
('Egress', 'Safety', 'Emergency egress inspection'),
('Landscaping/Egress', 'Site Work', 'Landscaping and egress path inspection'),
('Final Building', 'Final', 'Final building inspection'),
('Pool Shell', 'Pool', 'Swimming pool shell inspection'),
('Pool Plumbing Rough', 'Pool', 'Pool plumbing rough-in inspection'),
('Pool Bonding', 'Pool', 'Pool electrical bonding inspection'),
('Pool Shell II (Pre-Gunite)', 'Pool', 'Pre-gunite pool shell inspection'),
('Pool Deck', 'Pool', 'Pool deck construction inspection'),
('Pool Equipment', 'Pool', 'Pool equipment installation inspection'),
('Pool Gas', 'Pool', 'Pool gas line inspection'),
('Pool Alarms', 'Pool', 'Pool safety alarm inspection'),
('Pool Final', 'Pool', 'Final pool inspection');