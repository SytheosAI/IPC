import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
    
    const searchTerm = query.trim().toLowerCase();
    const results = [];
    
    // Search VBA Projects
    try {
      const { data: vbaProjects } = await supabase
        .from('vba_projects')
        .select('id, project_name, project_number, address, status')
        .or(`project_name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,project_number.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (vbaProjects) {
        results.push(...vbaProjects.map(project => ({
          id: `vba-${project.id}`,
          type: 'inspection',
          title: project.project_name,
          description: `${project.address} • ${project.status}`,
          url: `/vba/project/${project.id}`,
          relevance: calculateRelevance(searchTerm, project.project_name + ' ' + project.address)
        })));
      }
    } catch (error) {
      console.error('VBA Projects search error:', error);
    }
    
    // Search Projects
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, project_name, permit_number, address, status')
        .or(`project_name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,permit_number.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (projects) {
        results.push(...projects.map(project => ({
          id: `project-${project.id}`,
          type: 'project',
          title: project.project_name,
          description: `${project.address} • ${project.status}`,
          url: `/projects/${project.id}`,
          relevance: calculateRelevance(searchTerm, project.project_name + ' ' + project.address)
        })));
      }
    } catch (error) {
      console.error('Projects search error:', error);
    }
    
    // Search Documents
    try {
      const { data: documents } = await supabase
        .from('documents')
        .select('id, name, category, project_id, status')
        .ilike('name', `%${searchTerm}%`)
        .limit(10);
      
      if (documents) {
        results.push(...documents.map(doc => ({
          id: `document-${doc.id}`,
          type: 'document',
          title: doc.name,
          description: `${doc.category} • ${doc.status}`,
          url: `/documents/${doc.id}`,
          relevance: calculateRelevance(searchTerm, doc.name)
        })));
      }
    } catch (error) {
      console.error('Documents search error:', error);
    }
    
    // Search Submittals
    try {
      const { data: submittals } = await supabase
        .from('submittals')
        .select('id, title, permit_number, status, project_name')
        .or(`title.ilike.%${searchTerm}%,permit_number.ilike.%${searchTerm}%,project_name.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (submittals) {
        results.push(...submittals.map(submittal => ({
          id: `submittal-${submittal.id}`,
          type: 'submittal',
          title: submittal.title,
          description: `${submittal.project_name} • ${submittal.status}`,
          url: `/submittals/${submittal.id}`,
          relevance: calculateRelevance(searchTerm, submittal.title + ' ' + (submittal.project_name || ''))
        })));
      }
    } catch (error) {
      console.error('Submittals search error:', error);
    }
    
    // Search Contacts
    try {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, email, company, role')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (contacts) {
        results.push(...contacts.map(contact => ({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: contact.name,
          description: `${contact.company || contact.email} • ${contact.role || 'Contact'}`,
          url: `/members#contact-${contact.id}`,
          relevance: calculateRelevance(searchTerm, contact.name + ' ' + (contact.company || ''))
        })));
      }
    } catch (error) {
      console.error('Contacts search error:', error);
    }
    
    // Sort by relevance and return top 20 results
    const sortedResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);
    
    // Log search activity
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'global_search',
          user_id: 'system', // Replace with actual user ID when auth is enabled
          metadata: {
            query: searchTerm,
            results_count: sortedResults.length
          }
        }]);
    } catch (logError) {
      console.error('Search activity log error:', logError);
    }
    
    return NextResponse.json({ results: sortedResults });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

function calculateRelevance(searchTerm: string, content: string): number {
  const contentLower = content.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  // Exact match gets highest score
  if (contentLower.includes(searchLower)) {
    const index = contentLower.indexOf(searchLower);
    // Earlier matches get higher scores
    return 100 - index;
  }
  
  // Partial word matches
  const words = searchLower.split(' ');
  let matchCount = 0;
  
  for (const word of words) {
    if (contentLower.includes(word)) {
      matchCount++;
    }
  }
  
  return (matchCount / words.length) * 50;
}