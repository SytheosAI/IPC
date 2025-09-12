-- Add missing columns to existing organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS founded_year TEXT,
ADD COLUMN IF NOT EXISTS company_type TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS main_phone TEXT,
ADD COLUMN IF NOT EXISTS main_email TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS suite TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS number_of_employees TEXT,
ADD COLUMN IF NOT EXISTS annual_revenue TEXT,
ADD COLUMN IF NOT EXISTS primary_industry TEXT,
ADD COLUMN IF NOT EXISTS secondary_industries TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_state TEXT,
ADD COLUMN IF NOT EXISTS billing_zip TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS date_format TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT,
ADD COLUMN IF NOT EXISTS language TEXT;

-- First check if the address column exists before trying to use it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'organizations' 
             AND column_name = 'address') THEN
    -- Update the new columns with data from old columns if they exist
    UPDATE public.organizations 
    SET company_name = COALESCE(company_name, name),
        street_address = COALESCE(street_address, address),
        main_phone = COALESCE(main_phone, phone),
        main_email = COALESCE(main_email, email);
  ELSE
    -- Just update company_name from name if address doesn't exist
    UPDATE public.organizations 
    SET company_name = COALESCE(company_name, name);
  END IF;
END $$;

-- Insert default organization data only if table is empty
INSERT INTO public.organizations (
  id,
  company_name,
  legal_name,
  tax_id,
  license_number,
  founded_year,
  company_type,
  logo_url,
  main_phone,
  main_email,
  support_email,
  website,
  street_address,
  suite,
  city,
  state,
  zip_code,
  country,
  number_of_employees,
  annual_revenue,
  primary_industry,
  secondary_industries,
  certifications,
  billing_address,
  billing_city,
  billing_state,
  billing_zip,
  payment_method,
  billing_email,
  timezone,
  date_format,
  currency,
  language
) 
SELECT 
  gen_random_uuid(),
  'IPC Solutions Inc.',
  'Intelligent Plan Check Solutions, Inc.',
  '88-1234567',
  'FL-BC-123456',
  '2020',
  'Corporation',
  '',
  '(239) 555-0100',
  'info@ipcsolutions.com',
  'support@ipcsolutions.com',
  'https://ipcsolutions.com',
  '123 Innovation Drive',
  'Suite 400',
  'Fort Myers',
  'FL',
  '33901',
  'United States',
  '25-50',
  '$5M - $10M',
  'Construction Technology',
  ARRAY['Building Inspection', 'Permit Management', 'Compliance Software'],
  ARRAY['ISO 9001:2015', 'SOC 2 Type II', 'OSHA Certified'],
  '123 Innovation Drive',
  'Fort Myers',
  'FL',
  '33901',
  'Credit Card',
  'billing@ipcsolutions.com',
  'America/New_York',
  'MM/DD/YYYY',
  'USD',
  'English'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations);

-- Create trigger to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS if not already enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read organization data" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated users to update organization data" ON public.organizations;

-- Create RLS policies - allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read organization data"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policy - allow all authenticated users to update (since it's a singleton)
CREATE POLICY "Allow authenticated users to update organization data"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);