import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== RLS Test API Endpoint ===')
    
    // Create server-side Supabase client
    const { supabase, error: clientError } = await createServerClient()
    if (!supabase) {
      return clientError || NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 })
    }
    
    // Check current auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('Session check:', session ? 'Active' : 'None', sessionError || '')
    console.log('User check:', user ? `User ID: ${user.id}` : 'No user', userError || '')
    
    if (!session || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        details: {
          session: !!session,
          user: !!user,
          sessionError: sessionError?.message,
          userError: userError?.message
        }
      }, { status: 401 })
    }
    
    // Test 1: Try to read VBA projects
    console.log('Test 1: Reading VBA projects...')
    const { data: projects, error: readError } = await supabase
      .from('vba_projects')
      .select('*')
      .limit(5)
    
    console.log('Read result:', projects ? `Found ${projects.length} projects` : 'No data', readError || '')
    
    // Test 2: Try to create a test VBA project
    console.log('Test 2: Creating test VBA project...')
    const testProject = {
      project_name: `RLS Test ${Date.now()}`,
      address: '123 Test St',
      status: 'scheduled' as const,
      project_number: `TEST-${Date.now()}`,
      created_by: user.id
    }
    
    const { data: createdProject, error: createError } = await supabase
      .from('vba_projects')
      .insert(testProject as any)
      .select()
      .single()
    
    console.log('Create result:', createdProject ? 'Success' : 'Failed', createError || '')
    
    // Test 3: If created, try to update it
    let updateResult = null
    if (createdProject) {
      console.log('Test 3: Updating test project...')
      const { data: updated, error: updateError } = await supabase
        .from('vba_projects')
        .update({ notes: 'Updated via RLS test' } as any)
        .eq('id', createdProject.id)
        .select()
        .single()
      
      updateResult = {
        success: !!updated,
        data: updated,
        error: updateError?.message
      }
      console.log('Update result:', updated ? 'Success' : 'Failed', updateError || '')
    }
    
    // Test 4: Clean up - delete test project
    let deleteResult = null
    if (createdProject) {
      console.log('Test 4: Deleting test project...')
      const { error: deleteError } = await supabase
        .from('vba_projects')
        .delete()
        .eq('id', createdProject.id)
      
      deleteResult = {
        success: !deleteError,
        error: deleteError?.message
      }
      console.log('Delete result:', deleteError ? 'Failed' : 'Success', deleteError || '')
    }
    
    // Test 5: Check if auth.uid() function works
    console.log('Test 5: Testing auth.uid() function...')
    const { data: authTest, error: authTestError } = await supabase
      .rpc('get_current_user_id')
      .single()
    
    console.log('auth.uid() test:', authTest || 'No result', authTestError || '')
    
    // Compile results
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      auth: {
        isAuthenticated: true,
        userId: user.id,
        email: user.email,
        sessionToken: session.access_token ? 'Present' : 'Missing'
      },
      tests: {
        read: {
          success: !!projects && !readError,
          count: projects?.length || 0,
          error: readError?.message
        },
        create: {
          success: !!createdProject && !createError,
          projectId: createdProject?.id,
          error: createError?.message,
          errorCode: createError?.code
        },
        update: updateResult,
        delete: deleteResult,
        authFunction: {
          success: !!authTest && !authTestError,
          returnedUserId: authTest,
          matchesSessionUserId: authTest === user.id,
          error: authTestError?.message
        }
      }
    }
    
    return NextResponse.json(results)
    
  } catch (error: any) {
    console.error('RLS test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      stack: error.stack
    }, { status: 500 })
  }
}

// Also create POST endpoint for testing with specific data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_name, address } = body
    
    console.log('=== RLS Test POST Endpoint ===')
    console.log('Received data:', { project_name, address })
    
    // Create server-side Supabase client
    const { supabase, error: clientError } = await createServerClient()
    if (!supabase) {
      return clientError || NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 })
    }
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }
    
    // Try to create project with provided data
    const projectData = {
      project_name: project_name || `Test Project ${Date.now()}`,
      address: address || '456 Test Ave',
      status: 'scheduled' as const,
      project_number: `VBA-${Date.now()}`,
      created_by: user.id
    }
    
    console.log('Creating project with data:', projectData)
    
    const { data, error } = await supabase
      .from('vba_projects')
      .insert(projectData)
      .select()
      .single()
    
    if (error) {
      console.error('Create failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error,
        projectData
      }, { status: 400 })
    }
    
    console.log('Project created successfully:', data)
    
    return NextResponse.json({
      success: true,
      project: data,
      auth: {
        userId: user.id,
        email: user.email
      }
    })
    
  } catch (error: any) {
    console.error('RLS test POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}