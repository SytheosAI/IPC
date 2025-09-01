import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function setupAdmin() {
  console.log('=== Supabase Admin User Setup ===\n');
  
  // Get Supabase credentials
  const supabaseUrl = await question('Enter your Supabase URL: ');
  const serviceRoleKey = await question('Enter your Supabase Service Role Key (for admin operations): ');
  const adminEmail = 'mparish@meridianswfl.com';
  const adminPassword = await question('Enter password for admin user: ');
  
  // Create Supabase client with service role key for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('\n1. Creating admin user in Supabase Auth...');
    
    // Create user using admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('   User already exists in Auth. Attempting to update password...');
        
        // Update existing user's password - get list and find by email
        const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === adminEmail);
        
        if (getUserError) {
          throw getUserError;
        }
        
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { 
              password: adminPassword,
              email_confirm: true
            }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          console.log('   ✓ Password updated successfully');
          
          // Check if profile exists
          console.log('\n2. Checking profile in database...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', existingUser.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            console.log('   Creating admin profile...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: existingUser.id,
                email: adminEmail,
                name: 'Admin',
                role: 'admin',
                title: 'Administrator',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (insertError) {
              console.error('   Error creating profile:', insertError.message);
            } else {
              console.log('   ✓ Admin profile created successfully');
            }
          } else if (profile) {
            console.log('   ✓ Profile already exists');
            
            // Update role to admin if needed
            if (profile.role !== 'admin') {
              const { error: updateProfileError } = await supabase
                .from('profiles')
                .update({ role: 'admin', updated_at: new Date().toISOString() })
                .eq('user_id', existingUser.id);
              
              if (updateProfileError) {
                console.error('   Error updating profile role:', updateProfileError.message);
              } else {
                console.log('   ✓ Profile role updated to admin');
              }
            }
          }
        }
      } else {
        throw authError;
      }
    } else if (authUser && authUser.user) {
      console.log('   ✓ Admin user created successfully');
      
      // Create profile for new user
      console.log('\n2. Creating admin profile in database...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.user.id,
          email: adminEmail,
          name: 'Admin',
          role: 'admin',
          title: 'Administrator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        if (profileError.code === '23505') { // Duplicate key error
          console.log('   Profile already exists');
        } else {
          console.error('   Error creating profile:', profileError.message);
        }
      } else {
        console.log('   ✓ Admin profile created successfully');
      }
    }
    
    console.log('\n=== Setup Complete ===');
    console.log(`Admin email: ${adminEmail}`);
    console.log('You can now login with this email and the password you provided.');
    console.log('\nIMPORTANT: Password recovery has been set up. If you forget your password:');
    console.log('1. Click "Forgot password?" on the login page');
    console.log('2. Enter your email address');
    console.log('3. Check your email for the reset link');
    console.log('4. Make sure to check spam folder if you don\'t receive it');
    
  } catch (error: any) {
    console.error('\nError during setup:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure you\'re using the Service Role Key (not the anon key)');
    console.log('2. Verify your Supabase URL is correct');
    console.log('3. Check if email auth is enabled in your Supabase project');
    console.log('4. Ensure the profiles table exists in your database');
  } finally {
    rl.close();
  }
}

// Run the setup
setupAdmin();