import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const PLATFORM_FEE_PERCENTAGE = 0.12 // 12%

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100
}

export function calculateDriverPayout(amount: number): number {
  const fee = calculatePlatformFee(amount)
  return amount - fee
}

export async function createConnectedAccount(
  email: string,
  type: 'company' | 'driver'
) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: type === 'company' ? 'company' : 'individual',
  })

  return account
}

export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink
}

export async function createPaymentIntent(
  amount: number,
  companyStripeId: string,
  driverStripeId: string,
  loadId: string
) {
  const platformFee = calculatePlatformFee(amount)
  const driverPayout = calculateDriverPayout(amount)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    application_fee_amount: Math.round(platformFee * 100),
    transfer_data: {
      destination: driverStripeId,
    },
    metadata: {
      load_id: loadId,
    },
  })

  return paymentIntent
}
