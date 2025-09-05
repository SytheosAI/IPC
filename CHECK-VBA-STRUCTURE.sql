-- CHECK WHAT COLUMNS VBA_PROJECTS ACTUALLY HAS

-- 1. Show all columns in vba_projects table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
ORDER BY ordinal_position;

-- 2. Check if we need to add missing columns
DO $$
BEGIN
    -- Add name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vba_projects' AND column_name = 'name') THEN
        ALTER TABLE vba_projects ADD COLUMN name TEXT;
    END IF;
    
    -- Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vba_projects' AND column_name = 'description') THEN
        ALTER TABLE vba_projects ADD COLUMN description TEXT;
    END IF;
    
    -- Add status column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vba_projects' AND column_name = 'status') THEN
        ALTER TABLE vba_projects ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- Add created_by column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vba_projects' AND column_name = 'created_by') THEN
        ALTER TABLE vba_projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vba_projects' AND column_name = 'created_at') THEN
        ALTER TABLE vba_projects ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vba_projects' AND column_name = 'updated_at') THEN
        ALTER TABLE vba_projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Show structure after adding columns
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'vba_projects'
ORDER BY ordinal_position;