-- =====================================================
-- ARCHITECTURAL ANALYSIS MODULE SCHEMA
-- ML/YOLO Continuous Learning with Pattern Recognition
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For ML embeddings
CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- For scheduled analysis

-- =====================================================
-- CORE ANALYSIS TABLES
-- =====================================================

-- Main analysis runs table
CREATE TABLE architecture_analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_number TEXT UNIQUE NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('full', 'partial', 'component', 'ui', 'backend', 'database', 'security', 'performance')),
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'scanning', 'analyzing', 'ml_processing', 'completed', 'failed')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_components_analyzed INTEGER DEFAULT 0,
    total_issues_found INTEGER DEFAULT 0,
    total_opportunities_found INTEGER DEFAULT 0,
    overall_health_score DECIMAL(5,2), -- 0-100 score
    ml_model_version TEXT,
    initiated_by UUID REFERENCES profiles(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System components catalog
CREATE TABLE system_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_name TEXT NOT NULL,
    component_type TEXT NOT NULL CHECK (component_type IN ('ui', 'api', 'service', 'database', 'middleware', 'library', 'configuration', 'infrastructure')),
    file_path TEXT,
    module_path TEXT,
    version TEXT,
    dependencies JSONB, -- List of dependencies with versions
    metrics JSONB, -- Performance metrics, size, complexity
    last_modified TIMESTAMP WITH TIME ZONE,
    component_hash TEXT, -- For change detection
    is_active BOOLEAN DEFAULT true,
    parent_component_id UUID REFERENCES system_components(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ISSUE DETECTION TABLES
-- =====================================================

-- Detected architectural issues
CREATE TABLE architecture_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES architecture_analysis_runs(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('hole', 'gap', 'redundancy', 'inefficiency', 'security_vulnerability', 'performance_bottleneck', 'technical_debt', 'compatibility', 'scalability')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
    component_id UUID REFERENCES system_components(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location JSONB, -- File path, line numbers, etc.
    impact_score DECIMAL(5,2), -- 0-100 impact on system
    detection_confidence DECIMAL(5,2), -- ML confidence score 0-100
    suggested_fix TEXT,
    estimated_fix_effort TEXT CHECK (estimated_fix_effort IN ('trivial', 'small', 'medium', 'large', 'massive')),
    auto_fixable BOOLEAN DEFAULT false,
    fix_script TEXT, -- Automated fix if available
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'ignored', 'false_positive')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimization opportunities
CREATE TABLE optimization_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES architecture_analysis_runs(id) ON DELETE CASCADE,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('performance', 'code_refactor', 'architecture_redesign', 'caching', 'database_optimization', 'bundle_size', 'api_consolidation', 'component_reuse', 'dependency_update')),
    component_id UUID REFERENCES system_components(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    current_state JSONB, -- Current implementation details
    proposed_state JSONB, -- Proposed optimization details
    expected_improvement JSONB, -- Metrics on expected improvements
    implementation_complexity TEXT CHECK (implementation_complexity IN ('trivial', 'simple', 'moderate', 'complex', 'very_complex')),
    priority INTEGER CHECK (priority BETWEEN 1 AND 10),
    estimated_impact DECIMAL(5,2), -- 0-100 positive impact score
    ml_confidence DECIMAL(5,2), -- ML confidence in recommendation
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'in_progress', 'implemented', 'rejected', 'deferred')),
    implemented_at TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Component upgrade recommendations
CREATE TABLE component_upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES architecture_analysis_runs(id) ON DELETE CASCADE,
    component_id UUID REFERENCES system_components(id),
    current_version TEXT,
    recommended_version TEXT,
    upgrade_type TEXT CHECK (upgrade_type IN ('patch', 'minor', 'major', 'replacement')),
    reason TEXT NOT NULL,
    breaking_changes JSONB,
    migration_steps JSONB,
    risk_level TEXT CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
    benefits JSONB,
    ml_recommendation_score DECIMAL(5,2), -- 0-100
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'skipped', 'failed')),
    upgraded_at TIMESTAMP WITH TIME ZONE,
    upgraded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATTERN RECOGNITION & ML TABLES
-- =====================================================

-- Detected patterns in codebase
CREATE TABLE architecture_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name TEXT NOT NULL,
    pattern_type TEXT CHECK (pattern_type IN ('design_pattern', 'anti_pattern', 'code_smell', 'security_pattern', 'performance_pattern', 'ui_pattern')),
    description TEXT,
    occurrences INTEGER DEFAULT 0,
    locations JSONB, -- Array of locations where pattern is found
    is_beneficial BOOLEAN,
    pattern_signature TEXT, -- Pattern matching signature
    ml_embedding vector(1536), -- ML embedding for similarity search
    confidence_score DECIMAL(5,2),
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_detected TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML model training data
CREATE TABLE ml_training_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type TEXT NOT NULL CHECK (data_type IN ('issue_detection', 'pattern_recognition', 'optimization', 'component_analysis', 'performance_prediction')),
    input_data JSONB NOT NULL,
    output_label JSONB NOT NULL,
    feature_vector vector(1536), -- Feature embeddings
    model_version TEXT,
    confidence_score DECIMAL(5,2),
    is_validated BOOLEAN DEFAULT false,
    validation_result JSONB,
    used_for_training BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- YOLO object detection results for UI/UX analysis
CREATE TABLE yolo_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES architecture_analysis_runs(id) ON DELETE CASCADE,
    detection_type TEXT CHECK (detection_type IN ('ui_component', 'layout_issue', 'accessibility_issue', 'design_inconsistency', 'performance_indicator')),
    component_path TEXT,
    bounding_box JSONB, -- x, y, width, height
    confidence DECIMAL(5,2),
    class_label TEXT,
    metadata JSONB,
    screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FEEDBACK LOOP TABLES
-- =====================================================

-- User feedback on analysis results
CREATE TABLE analysis_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_type TEXT CHECK (reference_type IN ('issue', 'opportunity', 'upgrade', 'pattern')),
    reference_id UUID, -- ID of the related issue/opportunity/upgrade/pattern
    feedback_type TEXT CHECK (feedback_type IN ('accuracy', 'usefulness', 'false_positive', 'missed_issue', 'priority_adjustment')),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    corrected_data JSONB, -- User-provided corrections
    user_id UUID REFERENCES profiles(id),
    processed_for_ml BOOLEAN DEFAULT false, -- Has this been used to retrain models
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System learning history
CREATE TABLE ml_learning_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_type TEXT NOT NULL,
    model_version TEXT NOT NULL,
    training_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    training_samples INTEGER,
    accuracy_before DECIMAL(5,2),
    accuracy_after DECIMAL(5,2),
    precision_score DECIMAL(5,2),
    recall_score DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    training_duration_seconds INTEGER,
    hyperparameters JSONB,
    feature_importance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- METRICS & MONITORING TABLES
-- =====================================================

-- System health metrics over time
CREATE TABLE architecture_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('complexity', 'performance', 'security', 'maintainability', 'reliability', 'scalability')),
    metric_value DECIMAL(10,2),
    component_id UUID REFERENCES system_components(id),
    trend TEXT CHECK (trend IN ('improving', 'stable', 'degrading')),
    anomaly_detected BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis performance metrics
CREATE TABLE analysis_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES architecture_analysis_runs(id) ON DELETE CASCADE,
    phase TEXT CHECK (phase IN ('scanning', 'parsing', 'pattern_matching', 'ml_inference', 'report_generation')),
    duration_ms INTEGER,
    memory_usage_mb INTEGER,
    cpu_usage_percent DECIMAL(5,2),
    components_processed INTEGER,
    errors_encountered INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTING & VISUALIZATION TABLES
-- =====================================================

-- Analysis reports
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES architecture_analysis_runs(id) ON DELETE CASCADE,
    report_type TEXT CHECK (report_type IN ('executive_summary', 'technical_detailed', 'issue_report', 'optimization_report', 'trend_analysis')),
    title TEXT NOT NULL,
    summary TEXT,
    detailed_findings JSONB,
    visualizations JSONB, -- Chart configurations
    recommendations JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES profiles(id),
    shared_with TEXT[], -- Email addresses
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard configurations
CREATE TABLE analysis_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_name TEXT NOT NULL,
    owner_id UUID REFERENCES profiles(id),
    is_public BOOLEAN DEFAULT false,
    layout_config JSONB, -- Widget positions and sizes
    widget_configs JSONB, -- Individual widget settings
    refresh_interval INTEGER DEFAULT 300, -- Seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_analysis_runs_status ON architecture_analysis_runs(status);
CREATE INDEX idx_analysis_runs_date ON architecture_analysis_runs(start_time);
CREATE INDEX idx_components_type ON system_components(component_type);
CREATE INDEX idx_components_active ON system_components(is_active);
CREATE INDEX idx_issues_severity ON architecture_issues(severity);
CREATE INDEX idx_issues_status ON architecture_issues(status);
CREATE INDEX idx_issues_component ON architecture_issues(component_id);
CREATE INDEX idx_opportunities_priority ON optimization_opportunities(priority);
CREATE INDEX idx_opportunities_status ON optimization_opportunities(status);
CREATE INDEX idx_patterns_type ON architecture_patterns(pattern_type);
CREATE INDEX idx_patterns_embedding ON architecture_patterns USING ivfflat (ml_embedding vector_cosine_ops);
CREATE INDEX idx_training_embedding ON ml_training_data USING ivfflat (feature_vector vector_cosine_ops);
CREATE INDEX idx_feedback_processed ON analysis_feedback(processed_for_ml);
CREATE INDEX idx_metrics_date ON architecture_metrics(metric_date);
CREATE INDEX idx_metrics_component ON architecture_metrics(component_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE architecture_analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE architecture_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE architecture_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE yolo_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_learning_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE architecture_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_dashboards ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Authenticated users can view analysis runs" ON architecture_analysis_runs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create analysis runs" ON architecture_analysis_runs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view components" ON system_components
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view issues" ON architecture_issues
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can provide feedback" ON analysis_feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_analysis_runs_updated_at BEFORE UPDATE ON architecture_analysis_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON system_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON architecture_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON optimization_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upgrades_updated_at BEFORE UPDATE ON component_upgrades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON architecture_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON analysis_dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEDULED ANALYSIS JOBS (using pg_cron)
-- =====================================================
-- Schedule daily architectural analysis
SELECT cron.schedule('daily-architecture-analysis', '0 2 * * *', $$
    INSERT INTO architecture_analysis_runs (run_number, analysis_type, status)
    VALUES ('AUTO-' || to_char(NOW(), 'YYYYMMDD-HH24MISS'), 'full', 'initiated');
$$);

-- Schedule weekly ML model retraining check
SELECT cron.schedule('weekly-ml-retrain-check', '0 3 * * 0', $$
    INSERT INTO ml_learning_history (model_type, model_version, training_samples)
    SELECT 'architecture_analyzer', 'pending_check', COUNT(*)
    FROM ml_training_data
    WHERE used_for_training = false;
$$);