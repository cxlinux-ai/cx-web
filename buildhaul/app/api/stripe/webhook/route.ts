import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object

        // Update company or driver based on account details
        if (account.business_type === 'company') {
          await supabase
            .from('companies')
            .update({ verified: account.charges_enabled })
            .eq('stripe_account_id', account.id)
        } else {
          await supabase
            .from('drivers')
            .update({ verified: account.charges_enabled })
            .eq('stripe_account_id', account.id)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const loadId = paymentIntent.metadata.load_id

        if (loadId) {
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              stripe_payment_intent_id: paymentIntent.id,
              paid_at: new Date().toISOString(),
            })
            .eq('load_id', loadId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const loadId = paymentIntent.metadata.load_id

        if (loadId) {
          await supabase
            .from('payments')
            .update({
              status: 'failed',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('load_id', loadId)
        }
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object

        // Update payment with transfer ID
        await supabase
          .from('payments')
          .update({ stripe_transfer_id: transfer.id })
          .eq('driver_id', transfer.destination)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
