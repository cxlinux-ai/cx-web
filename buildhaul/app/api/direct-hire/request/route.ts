import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { load_id, driver_id, amount, message } = body

    if (!load_id || !driver_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify load belongs to company
    const { data: load } = await supabase
      .from('loads')
      .select('id, company_id')
      .eq('id', load_id)
      .eq('company_id', company.id)
      .single()

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Create expiration time (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create direct hire request
    const { data: request, error: requestError } = await supabase
      .from('direct_hire_requests')
      .insert({
        load_id,
        company_id: company.id,
        driver_id,
        amount,
        message,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (requestError) throw requestError

    // Get driver's profile to send notification
    const { data: driver } = await supabase
      .from('drivers')
      .select('profile_id')
      .eq('id', driver_id)
      .single()

    if (driver) {
      await supabase.from('notifications').insert({
        user_id: driver.profile_id,
        type: 'system',
        title: 'Direct Hire Request',
        message: `You have a direct hire request for $${amount}`,
        data: {
          direct_hire_request_id: request.id,
          load_id,
        },
      })
    }

    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error('Direct hire request error:', error)
    return NextResponse.json(
      { error: 'Failed to create direct hire request' },
      { status: 500 }
    )
  }
}
