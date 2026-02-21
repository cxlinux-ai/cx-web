import Stripe from "stripe";
import { Router, Request, Response } from "express";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import {
  stripeCustomers,
  stripeSubscriptions,
  stripePayments,
  stripeRefunds,
  stripeDisputes,
  stripeInvoicePayments,
  insertStripeCustomerSchema,
} from "@shared/schema";
import { z } from "zod";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("STRIPE_SECRET_KEY not configured - Stripe endpoints will be disabled");
}

const router = Router();

const requireStripe = (req: Request, res: Response, next: Function) => {
  if (!stripe) {
    return res.status(503).json({ error: "Stripe is not configured. Please set STRIPE_SECRET_KEY." });
  }
  next();
};

// =============================================================================
// CHECKOUT SESSION ENDPOINTS
// =============================================================================

// Stripe price IDs for each plan
const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  pro: {
    monthly: 'price_1SqYQjJ4X1wkC4EsLDB6ZbOk',
    annual: 'price_1SqYQjJ4X1wkC4EslIkZEJFZ'
  },
  team: {
    monthly: 'price_1SqYQkJ4X1wkC4Es8OMt79pZ',
    annual: 'price_1SqYQkJ4X1wkC4EsWYwUgceu'
  },
  enterprise: {
    monthly: 'price_1SqYQkJ4X1wkC4EsCFVBHYnT',
    annual: 'price_1SqYQlJ4X1wkC4EsJcPW7Of2'
  },
};

const PLAN_NAMES: Record<string, string> = {
  pro: "Pro",
  team: "Team",
  enterprise: "Enterprise",
};

const checkoutSessionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  company: z.string().optional(),
  planId: z.enum(["pro", "team", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  referralCode: z.string().optional(),
});

router.post("/checkout-session", requireStripe, async (req: Request, res: Response) => {
  try {
    const result = checkoutSessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    }

    const { email, name, company, planId, billingCycle, successUrl, cancelUrl, referralCode } = result.data;

    const priceConfig = PRICE_IDS[planId];
    if (!priceConfig) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    const priceId = billingCycle === "annual" ? priceConfig.annual : priceConfig.monthly;

    // Create or get customer
    let customer: Stripe.Customer | undefined;
    const existingCustomers = await stripe!.customers.list({ email, limit: 1 });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      await stripe!.customers.update(customer.id, {
        name,
        metadata: { company: company || "", planId, billingCycle },
      });
    } else {
      customer = await stripe!.customers.create({
        email,
        name,
        metadata: { company: company || "", planId, billingCycle },
      });
    }

    const session = await stripe!.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { planId, billingCycle, ref: referralCode || "" },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        planId,
        billingCycle,
        company: company || "",
        ref: referralCode || "",
      },
    });

    console.log(`Created checkout session: ${session.id} for ${email}`);
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/create-portal-session", requireStripe, async (req: Request, res: Response) => {
  try {
    const { email, returnUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const customers = await stripe!.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: "No subscription found for this email" });
    }

    const customer = customers.data[0];

    const session = await stripe!.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${req.headers.origin || "https://cxlinux.com"}/account`,
    });

    console.log(`Created portal session for ${email}`);
    res.json({ url: session.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

router.get("/checkout-session/:sessionId", requireStripe, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe!.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const customer = session.customer as Stripe.Customer;
    const subscription = session.subscription as Stripe.Subscription;

    let trialEnds = "N/A";
    if (subscription && subscription.trial_end) {
      const trialEndDate = new Date(subscription.trial_end * 1000);
      trialEnds = trialEndDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    const planId = session.metadata?.planId || "pro";
    const billingCycle = session.metadata?.billingCycle || "monthly";

    res.json({
      email: customer?.email || session.customer_email || "",
      planName: PLAN_NAMES[planId] || "Pro",
      billingCycle,
      trialEnds,
      status: session.status,
      subscriptionId: subscription?.id,
    });
  } catch (error) {
    console.error("Get checkout session error:", error);
    res.status(500).json({ error: "Failed to retrieve checkout session" });
  }
});

// =============================================================================
// CUSTOMER ENDPOINTS
// =============================================================================

const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

router.post("/customers", requireStripe, async (req: Request, res: Response) => {
  try {
    const result = createCustomerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    }

    const { email, name, userId, metadata } = result.data;

    const existingCustomer = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.email, email))
      .limit(1);

    if (existingCustomer.length > 0) {
      return res.status(200).json({ 
        message: "Customer already exists", 
        customer: existingCustomer[0] 
      });
    }

    const stripeCustomer = await stripe!.customers.create({
      email,
      name,
      metadata: metadata || {},
    });

    const [customer] = await db
      .insert(stripeCustomers)
      .values({
        stripeCustomerId: stripeCustomer.id,
        email,
        name,
        userId,
      })
      .returning();

    console.log(`Created Stripe customer: ${stripeCustomer.id}`);
    res.status(201).json({ customer });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

router.get("/customers/:id", requireStripe, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [customer] = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.id, id))
      .limit(1);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ customer });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ error: "Failed to get customer" });
  }
});

// =============================================================================
// SUBSCRIPTION ENDPOINTS
// =============================================================================

const createSubscriptionSchema = z.object({
  customerId: z.string(),
  priceId: z.string(),
  trialDays: z.number().optional(),
  metadata: z.record(z.string()).optional(),
});

router.post("/subscriptions", requireStripe, async (req: Request, res: Response) => {
  try {
    const result = createSubscriptionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    }

    const { customerId, priceId, trialDays, metadata } = result.data;

    const [customer] = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.id, customerId))
      .limit(1);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customer.stripeCustomerId,
      items: [{ price: priceId }],
      metadata: metadata || {},
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    };

    if (trialDays) {
      subscriptionParams.trial_period_days = trialDays;
    }

    const stripeSubscription = await stripe!.subscriptions.create(subscriptionParams);

    const subData = stripeSubscription as any;
    const [subscription] = await db
      .insert(stripeSubscriptions)
      .values({
        customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        status: stripeSubscription.status,
        currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : null,
        currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      })
      .returning();

    console.log(`Created subscription: ${stripeSubscription.id}`);

    const latestInvoice = stripeSubscription.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent | null;

    res.status(201).json({
      subscription,
      clientSecret: paymentIntent?.client_secret,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

router.delete("/subscriptions/:id", requireStripe, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { immediately } = req.query;

    const [subscription] = await db
      .select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.id, id))
      .limit(1);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    let stripeSubscription: Stripe.Subscription;

    if (immediately === "true") {
      stripeSubscription = await stripe!.subscriptions.cancel(subscription.stripeSubscriptionId);
    } else {
      stripeSubscription = await stripe!.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    await db
      .update(stripeSubscriptions)
      .set({
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, id));

    console.log(`Canceled subscription: ${subscription.stripeSubscriptionId}`);
    res.json({ message: "Subscription canceled", subscription: stripeSubscription });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

router.post("/subscriptions/:id/pause", requireStripe, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [subscription] = await db
      .select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.id, id))
      .limit(1);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const stripeSubscription = await stripe!.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: { behavior: "mark_uncollectible" },
    });

    await db
      .update(stripeSubscriptions)
      .set({
        status: "paused",
        pausedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, id));

    console.log(`Paused subscription: ${subscription.stripeSubscriptionId}`);
    res.json({ message: "Subscription paused", subscription: stripeSubscription });
  } catch (error) {
    console.error("Pause subscription error:", error);
    res.status(500).json({ error: "Failed to pause subscription" });
  }
});

router.post("/subscriptions/:id/resume", requireStripe, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [subscription] = await db
      .select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.id, id))
      .limit(1);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const stripeSubscription = await stripe!.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: null,
    });

    await db
      .update(stripeSubscriptions)
      .set({
        status: stripeSubscription.status,
        pausedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, id));

    console.log(`Resumed subscription: ${subscription.stripeSubscriptionId}`);
    res.json({ message: "Subscription resumed", subscription: stripeSubscription });
  } catch (error) {
    console.error("Resume subscription error:", error);
    res.status(500).json({ error: "Failed to resume subscription" });
  }
});

// =============================================================================
// PAYMENT ENDPOINTS
// =============================================================================

const createPaymentSchema = z.object({
  customerId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("usd"),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

router.post("/payments", requireStripe, async (req: Request, res: Response) => {
  try {
    const result = createPaymentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    }

    const { customerId, amount, currency, description, metadata } = result.data;

    const [customer] = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.id, customerId))
      .limit(1);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const paymentIntent = await stripe!.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customer.stripeCustomerId,
      description,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    const [payment] = await db
      .insert(stripePayments)
      .values({
        customerId,
        stripePaymentIntentId: paymentIntent.id,
        amount: Math.round(amount * 100),
        currency,
        status: paymentIntent.status,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    console.log(`Created payment intent: ${paymentIntent.id}`);
    res.status(201).json({
      payment,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// =============================================================================
// REFUND ENDPOINTS
// =============================================================================

const createRefundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"]).optional(),
});

router.post("/refunds", requireStripe, async (req: Request, res: Response) => {
  try {
    const result = createRefundSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    }

    const { paymentId, amount, reason } = result.data;

    const [payment] = await db
      .select()
      .from(stripePayments)
      .where(eq(stripePayments.id, paymentId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: payment.stripePaymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const stripeRefund = await stripe!.refunds.create(refundParams);

    const [refund] = await db
      .insert(stripeRefunds)
      .values({
        paymentId,
        stripeRefundId: stripeRefund.id,
        amount: stripeRefund.amount,
        reason: reason || null,
        status: stripeRefund.status || "pending",
      })
      .returning();

    console.log(`Created refund: ${stripeRefund.id}`);
    res.status(201).json({ refund });
  } catch (error) {
    console.error("Create refund error:", error);
    res.status(500).json({ error: "Failed to create refund" });
  }
});

// =============================================================================
// WEBHOOK ENDPOINT
// =============================================================================

router.post("/webhooks", requireStripe, async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Webhook secret not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = (req as any).rawBody;
    event = stripe!.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  console.log(`Received webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.created": {
        const customer = event.data.object as Stripe.Customer;
        const existing = await db
          .select()
          .from(stripeCustomers)
          .where(eq(stripeCustomers.stripeCustomerId, customer.id))
          .limit(1);

        if (existing.length === 0 && customer.email) {
          await db.insert(stripeCustomers).values({
            stripeCustomerId: customer.id,
            email: customer.email,
            name: customer.name || null,
          });
          console.log(`Webhook: Created customer ${customer.id}`);
        }
        break;
      }

      case "customer.deleted": {
        const customer = event.data.object as Stripe.Customer;
        await db
          .delete(stripeCustomers)
          .where(eq(stripeCustomers.stripeCustomerId, customer.id));
        console.log(`Webhook: Deleted customer ${customer.id}`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const existing = await db
          .select()
          .from(stripeSubscriptions)
          .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(stripeSubscriptions)
            .set({
              status: subscription.status,
              currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
              currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
              updatedAt: new Date(),
            })
            .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id));
          console.log(`Webhook: Updated subscription ${subscription.id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db
          .update(stripeSubscriptions)
          .set({
            status: "canceled",
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(stripeSubscriptions.stripeSubscriptionId, subscription.id));
        console.log(`Webhook: Subscription deleted ${subscription.id}`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        const invoiceCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

        if (invoiceCustomerId) {
          const [customer] = await db
            .select()
            .from(stripeCustomers)
            .where(eq(stripeCustomers.stripeCustomerId, invoiceCustomerId))
            .limit(1);

          if (customer && invoice.id) {
            let subscriptionId: string | null = null;
            if (invoice.subscription) {
              const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;
              const [sub] = await db
                .select()
                .from(stripeSubscriptions)
                .where(eq(stripeSubscriptions.stripeSubscriptionId, subId))
                .limit(1);
              subscriptionId = sub?.id || null;
            }

            await db.insert(stripeInvoicePayments).values({
              customerId: customer.id,
              stripeInvoiceId: invoice.id,
              subscriptionId,
              amount: invoice.amount_paid || 0,
              currency: invoice.currency || "usd",
              status: "paid",
              paidAt: new Date(),
            });
            console.log(`Webhook: Invoice paid ${invoice.id}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Webhook: Invoice payment failed ${invoice.id}`);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await db
          .update(stripePayments)
          .set({
            status: "succeeded",
            updatedAt: new Date(),
          })
          .where(eq(stripePayments.stripePaymentIntentId, paymentIntent.id));
        console.log(`Webhook: Payment succeeded ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await db
          .update(stripePayments)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(stripePayments.stripePaymentIntentId, paymentIntent.id));
        console.log(`Webhook: Payment failed ${paymentIntent.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Webhook: Charge refunded ${charge.id}`);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        await db.insert(stripeDisputes).values({
          stripeDisputeId: dispute.id,
          chargeId: typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id || "",
          paymentIntentId: typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id,
          amount: dispute.amount,
          currency: dispute.currency,
          status: dispute.status,
          reason: dispute.reason,
        });
        console.log(`Webhook: Dispute created ${dispute.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// =============================================================================
// ANALYTICS ENDPOINTS
// =============================================================================

router.get("/analytics/revenue", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const payments = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${stripePayments.amount}), 0)`,
        successfulPayments: sql<number>`COUNT(CASE WHEN ${stripePayments.status} = 'succeeded' THEN 1 END)`,
        failedPayments: sql<number>`COUNT(CASE WHEN ${stripePayments.status} = 'failed' THEN 1 END)`,
        totalPayments: sql<number>`COUNT(*)`,
      })
      .from(stripePayments)
      .where(and(gte(stripePayments.createdAt, start), lte(stripePayments.createdAt, end)));

    const refunds = await db
      .select({
        totalRefunds: sql<number>`COALESCE(SUM(${stripeRefunds.amount}), 0)`,
        refundCount: sql<number>`COUNT(*)`,
      })
      .from(stripeRefunds)
      .where(and(gte(stripeRefunds.createdAt, start), lte(stripeRefunds.createdAt, end)));

    const invoices = await db
      .select({
        invoiceRevenue: sql<number>`COALESCE(SUM(${stripeInvoicePayments.amount}), 0)`,
        paidInvoices: sql<number>`COUNT(CASE WHEN ${stripeInvoicePayments.status} = 'paid' THEN 1 END)`,
      })
      .from(stripeInvoicePayments)
      .where(and(gte(stripeInvoicePayments.createdAt, start), lte(stripeInvoicePayments.createdAt, end)));

    const totalRevenue = (Number(payments[0]?.totalRevenue) || 0) + (Number(invoices[0]?.invoiceRevenue) || 0);
    const netRevenue = totalRevenue - (Number(refunds[0]?.totalRefunds) || 0);

    res.json({
      period: { start, end },
      revenue: {
        gross: totalRevenue / 100,
        refunds: (Number(refunds[0]?.totalRefunds) || 0) / 100,
        net: netRevenue / 100,
      },
      payments: {
        successful: Number(payments[0]?.successfulPayments) || 0,
        failed: Number(payments[0]?.failedPayments) || 0,
        total: Number(payments[0]?.totalPayments) || 0,
      },
      invoices: {
        paid: Number(invoices[0]?.paidInvoices) || 0,
      },
      refunds: {
        count: Number(refunds[0]?.refundCount) || 0,
      },
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({ error: "Failed to get revenue analytics" });
  }
});

// =============================================================================
// CHECKOUT SESSION ENDPOINT (for Pricing Page)
// =============================================================================

const createCheckoutSessionSchema = z.object({
  priceId: z.string(),
  annual: z.boolean().optional(),
});

router.post("/create-checkout-session", requireStripe, async (req: Request, res: Response) => {
  try {
    const result = createCheckoutSessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error.flatten() });
    }

    const { priceId } = result.data;
    
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'https://cortexlinux.com';

    const session = await stripe!.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14
      }
    });

    console.log(`Created checkout session: ${session.id}`);
    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Create checkout session error:", error);
    
    // Provide user-friendly error messages
    let userMessage = "Failed to create checkout session";
    if (error.message?.includes("product is not active")) {
      userMessage = "This plan is currently being set up. Please try again later or contact support.";
    } else if (error.message?.includes("No such price")) {
      userMessage = "This pricing option is not available. Please refresh and try again.";
    } else if (error.message) {
      userMessage = error.message;
    }
    
    res.status(500).json({ error: userMessage });
  }
});

// =============================================================================
// SESSION DETAILS ENDPOINT (for Success Page)
// =============================================================================

const PRICE_TO_TIER: Record<string, { name: string; prefix: string }> = {
  'price_1SpotMJ4X1wkC4EspVzV5tT6': { name: 'Pro', prefix: 'CX-PRO-' },
  'price_1SpotMJ4X1wkC4Es3tuZGVHY': { name: 'Pro', prefix: 'CX-PRO-' },
  'price_1SpotNJ4X1wkC4EsN13pV2dA': { name: 'Enterprise', prefix: 'CORTEX-ENT-' },
  'price_1SpotNJ4X1wkC4Esw5ienNNQ': { name: 'Enterprise', prefix: 'CORTEX-ENT-' },
  'price_1SpotOJ4X1wkC4Es7ZqOzh1H': { name: 'Managed', prefix: 'CORTEX-MNG-' },
  'price_1SpotOJ4X1wkC4EslmMmWWZI': { name: 'Managed', prefix: 'CORTEX-MNG-' },
};

function generateLicenseKey(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = prefix;
  for (let i = 0; i < 4; i++) {
    if (i > 0) key += '-';
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return key;
}

router.get("/session/:sessionId", requireStripe, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe!.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'line_items']
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const customer = session.customer as Stripe.Customer;
    const subscription = session.subscription as Stripe.Subscription;
    const lineItems = session.line_items?.data || [];
    const priceId = lineItems[0]?.price?.id || '';

    const tierInfo = PRICE_TO_TIER[priceId] || { name: 'Pro', prefix: 'CX-PRO-' };
    const licenseKey = generateLicenseKey(tierInfo.prefix);

    res.json({
      success: true,
      email: customer?.email || session.customer_email,
      planName: tierInfo.name,
      licenseKey,
      subscriptionId: subscription?.id,
      trialEnd: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    });
  } catch (error: any) {
    console.error("Get session error:", error);
    res.status(500).json({ error: error.message || "Failed to get session details" });
  }
});

router.get("/analytics/subscriptions", async (req: Request, res: Response) => {
  try {
    const subscriptionStats = await db
      .select({
        status: stripeSubscriptions.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(stripeSubscriptions)
      .groupBy(stripeSubscriptions.status);

    const statusCounts: Record<string, number> = subscriptionStats.reduce(
      (acc: Record<string, number>, { status, count }: { status: string; count: number }) => {
        acc[status] = Number(count);
        return acc;
      },
      {} as Record<string, number>
    );

    const totalSubscriptions: number = Object.values(statusCounts).reduce((a: number, b: number) => a + b, 0);
    const activeSubscriptions = statusCounts["active"] || 0;
    const canceledSubscriptions = statusCounts["canceled"] || 0;
    const trialingSubscriptions = statusCounts["trialing"] || 0;
    const pausedSubscriptions = statusCounts["paused"] || 0;

    const churnRate = totalSubscriptions > 0 
      ? ((canceledSubscriptions / totalSubscriptions) * 100).toFixed(2) 
      : "0.00";

    const recentCancellations = await db
      .select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.status, "canceled"))
      .orderBy(desc(stripeSubscriptions.canceledAt))
      .limit(10);

    res.json({
      overview: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        trialing: trialingSubscriptions,
        paused: pausedSubscriptions,
        canceled: canceledSubscriptions,
        churnRate: `${churnRate}%`,
      },
      byStatus: statusCounts,
      recentCancellations: recentCancellations.map((sub: typeof stripeSubscriptions.$inferSelect) => ({
        id: sub.id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        canceledAt: sub.canceledAt,
      })),
    });
  } catch (error) {
    console.error("Subscription analytics error:", error);
    res.status(500).json({ error: "Failed to get subscription analytics" });
  }
});

export default router;
