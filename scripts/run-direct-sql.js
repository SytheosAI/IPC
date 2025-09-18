#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runOptimizations() {
  console.log('🚀 Running database optimizations...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Read and execute SQL file
  const sqlContent = fs.readFileSync('./scripts/apply-optimizations.sql', 'utf8');
  
  // Split into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      const { data, error } = await supabase
        .from('_sql')
        .select('*')
        .eq('query', statement);
      
      if (error) {
        console.log(`❌ Statement ${i + 1} failed:`, error.message);
      } else {
        console.log(`✅ Statement ${i + 1} completed`);
      }
    } catch (err) {
      console.log(`❌ Statement ${i + 1} error:`, err.message);
    }
  }
  
  console.log('🎉 Optimizations completed!');
}

runOptimizations().catch(console.error);