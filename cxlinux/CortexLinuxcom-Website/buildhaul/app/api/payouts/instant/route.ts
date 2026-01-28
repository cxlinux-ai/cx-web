import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const INSTANT_PAYOUT_FEE_PERCENTAGE = 0.015 // 1.5%

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
    const { payment_id } = body

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      )
    }

    // Get driver
    const { data: driver } = await supabase
      .from('drivers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    // Check if instant payout is enabled
    if (!driver.instant_payout_enabled) {
      return NextResponse.json(
        { error: 'Instant payout not enabled' },
        { status: 400 }
      )
    }

    // Check if bank account is verified
    if (!driver.instant_payout_bank_verified || !driver.stripe_account_id) {
      return NextResponse.json(
        { error: 'Bank account not verified' },
        { status: 400 }
      )
    }

    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .eq('driver_id', driver.id)
      .eq('status', 'completed')
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or not completed' },
        { status: 404 }
      )
    }

    // Check if instant payout already requested
    const { data: existing } = await supabase
      .from('instant_payouts')
      .select('*')
      .eq('payment_id', payment_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Instant payout already requested' },
        { status: 400 }
      )
    }

    // Calculate fees
    const amount = payment.driver_payout
    const fee = amount * INSTANT_PAYOUT_FEE_PERCENTAGE
    const netAmount = amount - fee

    // Create instant payout in Stripe
    let stripePayout
    try {
      stripePayout = await stripe.payouts.create(
        {
          amount: Math.round(netAmount * 100), // Convert to cents
          currency: 'usd',
          method: 'instant',
          description: `Instant payout for load payment ${payment_id}`,
        },
        {
          stripeAccount: driver.stripe_account_id,
        }
      )
    } catch (stripeError: any) {
      console.error('Stripe payout error:', stripeError)

      // Create failed payout record
      await supabase.from('instant_payouts').insert({
        payment_id,
        driver_id: driver.id,
        amount,
        fee,
        net_amount: netAmount,
        status: 'failed',
        error_message: stripeError.message,
      })

      return NextResponse.json(
        { error: stripeError.message },
        { status: 400 }
      )
    }

    // Create instant payout record
    const { data: instantPayout, error: payoutError } = await supabase
      .from('instant_payouts')
      .insert({
        payment_id,
        driver_id: driver.id,
        amount,
        fee,
        net_amount: netAmount,
        stripe_payout_id: stripePayout.id,
        status: 'processing',
      })
      .select()
      .single()

    if (payoutError) throw payoutError

    // Update driver earnings with instant payout fee
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('driver_earnings')
      .update({
        instant_payout_fees: supabase.raw(
          `instant_payout_fees + ${fee}`
        ),
      })
      .eq('driver_id', driver.id)
      .eq('date', today)

    return NextResponse.json({
      success: true,
      payout: instantPayout,
      stripe_payout_id: stripePayout.id,
      net_amount: netAmount,
      fee,
    })
  } catch (error) {
    console.error('Instant payout error:', error)
    return NextResponse.json(
      { error: 'Failed to process instant payout' },
      { status: 500 }
    )
  }
}
