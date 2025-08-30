-- Create inspection_photos table for VBA project photos
CREATE TABLE IF NOT EXISTS inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  vba_project_id UUID REFERENCES vba_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT CHECK (category IN ('before', 'during', 'after', 'issue', 'safety', 'general', 'electrical', 'plumbing', 'structural', 'mechanical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_project ON inspection_photos(vba_project_id);

-- Enable RLS
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view inspection photos" ON inspection_photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert inspection photos" ON inspection_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own inspection photos" ON inspection_photos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own inspection photos" ON inspection_photos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_inspection_photos_updated_at BEFORE UPDATE ON inspection_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample photos for testing (optional)
-- INSERT INTO inspection_photos (vba_project_id, category, url, caption) 
-- SELECT 
--   id,
--   'general',
--   'https://via.placeholder.com/400x300',
--   'Sample inspection photo'
-- FROM vba_projects
-- LIMIT 1;