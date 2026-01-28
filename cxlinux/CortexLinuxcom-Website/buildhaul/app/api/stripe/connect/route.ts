import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createConnectedAccount, createAccountLink } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, returnUrl, refreshUrl } = body

    if (type !== 'company' && type !== 'driver') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Check if account already exists
    let stripeAccountId = null

    if (type === 'company') {
      const { data: company } = await supabase
        .from('companies')
        .select('stripe_account_id')
        .eq('owner_id', user.id)
        .single()

      stripeAccountId = company?.stripe_account_id
    } else {
      const { data: driver } = await supabase
        .from('drivers')
        .select('stripe_account_id')
        .eq('profile_id', user.id)
        .single()

      stripeAccountId = driver?.stripe_account_id
    }

    // Create account if it doesn't exist
    if (!stripeAccountId) {
      const account = await createConnectedAccount(user.email!, type)
      stripeAccountId = account.id

      // Save to database
      if (type === 'company') {
        await supabase
          .from('companies')
          .update({ stripe_account_id: stripeAccountId })
          .eq('owner_id', user.id)
      } else {
        await supabase
          .from('drivers')
          .update({ stripe_account_id: stripeAccountId })
          .eq('profile_id', user.id)
      }
    }

    // Create account link for onboarding
    const accountLink = await createAccountLink(
      stripeAccountId,
      returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      refreshUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect`
    )

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
