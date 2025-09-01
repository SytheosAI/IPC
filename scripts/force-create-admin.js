// Force create admin user using Supabase service role
const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (already in .env.local)
const SUPABASE_URL = 'https://rxkakjowitqnbbjezedu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI1MzU1OCwiZXhwIjoyMDY5ODI5NTU4fQ.RugCai5lmT3_eIU55G7XzlqdQDy6dZLk-5JtXeIJmeA';

const ADMIN_EMAIL = 'mparish@meridianswfl.com';
const ADMIN_PASSWORD = 'Meridian';

async function createAdmin() {
  console.log('Creating admin user...\n');

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Method 1: Try using admin API
    console.log('Attempting to create user via admin API...');
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (adminError) {
      if (adminError.message.includes('already exists')) {
        console.log('User already exists, updating password...');
        
        // Get the existing user
        const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === ADMIN_EMAIL);
        
        if (getUserError) {
          throw getUserError;
        }
        
        if (existingUser) {
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { 
              password: ADMIN_PASSWORD,
              email_confirm: true
            }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          console.log('✅ Password updated successfully');
          console.log('User ID:', existingUser.id);
          
          // Ensure profile exists
          await ensureProfile(supabase, existingUser.id);
          
          console.log('\n========================================');
          console.log('✅ ADMIN USER READY!');
          console.log('========================================');
          console.log('Email:', ADMIN_EMAIL);
          console.log('Password:', ADMIN_PASSWORD);
          console.log('URL: http://localhost:3004/login');
          console.log('========================================\n');
          
          return;
        }
      } else {
        throw adminError;
      }
    } else if (adminUser && adminUser.user) {
      console.log('✅ User created successfully');
      console.log('User ID:', adminUser.user.id);
      
      // Create profile
      await ensureProfile(supabase, adminUser.user.id);
      
      console.log('\n========================================');
      console.log('✅ ADMIN USER CREATED!');
      console.log('========================================');
      console.log('Email:', ADMIN_EMAIL);
      console.log('Password:', ADMIN_PASSWORD);
      console.log('URL: http://localhost:3004/login');
      console.log('========================================\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Email provider is enabled in Supabase Dashboard');
    console.log('2. Go to Authentication > Providers > Email');
    console.log('3. Make sure it\'s enabled');
    console.log('4. Try running this script again\n');
  }
}

async function ensureProfile(supabase, userId) {
  console.log('Ensuring admin profile exists...');
  
  // Check if profile exists
  const { data: profile, error: getError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (getError && getError.code === 'PGRST116') {
    // Profile doesn't exist, create it
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin',
        title: 'Administrator',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Warning: Could not create profile:', insertError.message);
    } else {
      console.log('✅ Admin profile created');
    }
  } else if (profile) {
    // Update role to admin if needed
    if (profile.role !== 'admin') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          title: 'Administrator',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Warning: Could not update profile:', updateError.message);
      } else {
        console.log('✅ Profile updated to admin role');
      }
    } else {
      console.log('✅ Admin profile already exists');
    }
  }
}

// Run the script
createAdmin();