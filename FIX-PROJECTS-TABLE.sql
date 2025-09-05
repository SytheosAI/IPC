-- FIX PROJECTS TABLE - ADD MISSING COLUMNS

-- 1. Check what columns projects table currently has
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 2. Add missing columns to projects table
DO $$
BEGIN
    -- Add name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'name') THEN
        ALTER TABLE projects ADD COLUMN name TEXT;
    END IF;
    
    -- Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
    END IF;
    
    -- Add status column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- Add project_number column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'project_number') THEN
        ALTER TABLE projects ADD COLUMN project_number TEXT;
    END IF;
    
    -- Add client_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'client_name') THEN
        ALTER TABLE projects ADD COLUMN client_name TEXT;
    END IF;
    
    -- Add address column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'address') THEN
        ALTER TABLE projects ADD COLUMN address TEXT;
    END IF;
    
    -- Add city column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'city') THEN
        ALTER TABLE projects ADD COLUMN city TEXT;
    END IF;
    
    -- Add state column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'state') THEN
        ALTER TABLE projects ADD COLUMN state TEXT;
    END IF;
    
    -- Add zip column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'zip') THEN
        ALTER TABLE projects ADD COLUMN zip TEXT;
    END IF;
    
    -- Add created_by column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'created_at') THEN
        ALTER TABLE projects ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Show final structure
SELECT 
    'Projects table fixed' as status,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;