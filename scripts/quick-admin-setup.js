// Quick Admin Setup Script
// This script sets up the admin user with password "Meridian"

const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: Update these values with your Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://xxxxx.supabase.co'
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // Found in Supabase Dashboard > Settings > API

const ADMIN_EMAIL = 'mparish@meridianswfl.com';
const ADMIN_PASSWORD = 'Meridian';

async function setupAdmin() {
  console.log('=== Setting up Admin User ===\n');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}\n`);

  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
    console.error('ERROR: Please update SUPABASE_URL and SERVICE_ROLE_KEY in this script first!');
    console.log('\nTo find these values:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Settings > API');
    console.log('3. Copy the Project URL and Service Role Key');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Try to create the user
    console.log('Creating user in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('User already exists. Updating password...');
        
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL);
        
        if (existingUser && existingUser.user) {
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.user.id,
            { 
              password: ADMIN_PASSWORD,
              email_confirm: true
            }
          );
          
          if (updateError) throw updateError;
          console.log('✓ Password updated successfully');
          
          // Ensure profile exists with admin role
          await ensureAdminProfile(supabase, existingUser.user.id);
        }
      } else {
        throw authError;
      }
    } else if (authUser && authUser.user) {
      console.log('✓ User created successfully');
      await ensureAdminProfile(supabase, authUser.user.id);
    }
    
    console.log('\n=== Setup Complete! ===');
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('\nError:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify your Service Role Key is correct');
    console.log('2. Check that your Supabase URL is correct');
    console.log('3. Ensure email auth is enabled in Supabase');
  }
}

async function ensureAdminProfile(supabase, userId) {
  console.log('Setting up admin profile...');
  
  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    // Create profile
    const { error } = await supabase
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
    
    if (error && error.code !== '23505') {
      console.error('Warning: Could not create profile:', error.message);
    } else {
      console.log('✓ Admin profile created');
    }
  } else {
    // Update role to admin if needed
    if (profile.role !== 'admin') {
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', userId);
      console.log('✓ Profile updated to admin role');
    } else {
      console.log('✓ Admin profile already exists');
    }
  }
}

// Run the setup
setupAdmin();