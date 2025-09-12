import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching organization:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || {})
  } catch (error) {
    console.error('Error in GET /api/organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    
    // First, check if organization exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .single()
    
    let result
    
    if (existingOrg) {
      // Update existing organization
      result = await supabase
        .from('organizations')
        .update({
          company_name: body.companyName,
          legal_name: body.legalName,
          tax_id: body.taxId,
          license_number: body.licenseNumber,
          founded_year: body.foundedYear,
          company_type: body.companyType,
          logo_url: body.logoUrl,
          main_phone: body.mainPhone,
          main_email: body.mainEmail,
          support_email: body.supportEmail,
          website: body.website,
          street_address: body.streetAddress,
          suite: body.suite,
          city: body.city,
          state: body.state,
          zip_code: body.zipCode,
          country: body.country,
          number_of_employees: body.numberOfEmployees,
          annual_revenue: body.annualRevenue,
          primary_industry: body.primaryIndustry,
          secondary_industries: body.secondaryIndustries,
          certifications: body.certifications,
          billing_address: body.billingAddress,
          billing_city: body.billingCity,
          billing_state: body.billingState,
          billing_zip: body.billingZip,
          payment_method: body.paymentMethod,
          billing_email: body.billingEmail,
          timezone: body.timezone,
          date_format: body.dateFormat,
          currency: body.currency,
          language: body.language
        })
        .eq('id', existingOrg.id)
        .select()
        .single()
    } else {
      // Insert new organization
      result = await supabase
        .from('organizations')
        .insert({
          company_name: body.companyName,
          legal_name: body.legalName,
          tax_id: body.taxId,
          license_number: body.licenseNumber,
          founded_year: body.foundedYear,
          company_type: body.companyType,
          logo_url: body.logoUrl,
          main_phone: body.mainPhone,
          main_email: body.mainEmail,
          support_email: body.supportEmail,
          website: body.website,
          street_address: body.streetAddress,
          suite: body.suite,
          city: body.city,
          state: body.state,
          zip_code: body.zipCode,
          country: body.country,
          number_of_employees: body.numberOfEmployees,
          annual_revenue: body.annualRevenue,
          primary_industry: body.primaryIndustry,
          secondary_industries: body.secondaryIndustries,
          certifications: body.certifications,
          billing_address: body.billingAddress,
          billing_city: body.billingCity,
          billing_state: body.billingState,
          billing_zip: body.billingZip,
          payment_method: body.paymentMethod,
          billing_email: body.billingEmail,
          timezone: body.timezone,
          date_format: body.dateFormat,
          currency: body.currency,
          language: body.language
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error('Error saving organization:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error in PUT /api/organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}