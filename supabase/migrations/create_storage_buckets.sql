-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('documents', 'documents', true),
  ('inspection-photos', 'inspection-photos', true),
  ('field-report-photos', 'field-report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id IN ('documents', 'inspection-photos', 'field-report-photos'));

CREATE POLICY "Authenticated users can upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id IN ('documents', 'inspection-photos', 'field-report-photos'));

CREATE POLICY "Users can update their own uploads" ON storage.objects 
  FOR UPDATE USING (bucket_id IN ('documents', 'inspection-photos', 'field-report-photos'));

CREATE POLICY "Users can delete their own uploads" ON storage.objects 
  FOR DELETE USING (bucket_id IN ('documents', 'inspection-photos', 'field-report-photos'));