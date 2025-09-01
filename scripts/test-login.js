// Test login directly to find the exact error
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rxkakjowitqnbbjezedu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTM1NTgsImV4cCI6MjA2OTgyOTU1OH0.h0tIYhWUsAsB5_rle4pB6OyiEuJx-V1MIYLSbisBIe8';

async function testLogin() {
  console.log('Testing login...\n');
  
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  
  try {
    // Test 1: Try to sign in
    console.log('Attempting login with mparish@meridianswfl.com / Meridian');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'mparish@meridianswfl.com',
      password: 'Meridian'
    });
    
    if (error) {
      console.error('❌ Login failed with error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      // If auth error, try to get more info
      if (error.message.includes('Invalid') || error.status === 400) {
        console.log('\n🔍 This means the user exists but password is wrong');
        console.log('Run RESET-ADMIN-PASSWORD.sql to fix');
      } else if (error.status === 500) {
        console.log('\n🔍 500 error - checking what\'s wrong...');
        
        // Test if we can reach Supabase at all
        const { data: healthCheck, error: healthError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (healthError) {
          console.log('❌ Cannot reach database:', healthError.message);
          console.log('Check if Supabase project is paused or has issues');
        } else {
          console.log('✅ Database connection works');
          console.log('❌ Auth system has an issue - check Supabase Dashboard logs');
        }
      }
    } else if (data && data.user) {
      console.log('✅ Login successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Session:', data.session ? 'Created' : 'No session');
    } else {
      console.log('❓ Unexpected response:', data);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
  
  console.log('\n-------------------\n');
  
  // Test 2: Check if user exists via service role
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MzU1OCwiZXhwIjoyMDY5ODI5NTU4fQ.RugCai5lmT3_eIU55G7XzlqdQDy6dZLk-5JtXeIJmeA';
  
  const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY);
  
  console.log('Checking user status with admin privileges...');
  
  try {
    const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Cannot list users:', error.message);
    } else {
      const adminUser = users?.find(u => u.email === 'mparish@meridianswfl.com');
      
      if (adminUser) {
        console.log('✅ User found in auth.users');
        console.log('User ID:', adminUser.id);
        console.log('Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
        console.log('Created:', adminUser.created_at);
        console.log('Last sign in:', adminUser.last_sign_in_at || 'Never');
        console.log('Banned:', adminUser.banned_until ? 'YES - BANNED!' : 'No');
        
        if (adminUser.banned_until) {
          console.log('\n❌ USER IS BANNED! Unban in Supabase Dashboard');
        }
      } else {
        console.log('❌ User not found in auth.users');
        console.log('Available users:', users?.map(u => u.email).join(', ') || 'None');
      }
    }
  } catch (err) {
    console.error('Admin check error:', err);
  }
}

testLogin();