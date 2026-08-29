import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';
import { Prisma } from '@prisma/client';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const userId = checkoutSession.metadata?.userId;
        const userEmail = checkoutSession.metadata?.userEmail;

        if (userId && userEmail) {
          await prisma.$transaction(async (tx) => {
            await tx.webhookEvent.create({ data: { id: event.id, type: event.type } });
            const user = await tx.user.findFirst({ where: { id: userId, email: userEmail } });
            if (!user) throw new Error('Checkout metadata does not match a user');

            await tx.payment.upsert({
              where: { checkoutSessionId: checkoutSession.id },
              update: { status: checkoutSession.payment_status },
              create: {
                userId: user.id,
                checkoutSessionId: checkoutSession.id,
                paymentIntentId: typeof checkoutSession.payment_intent === 'string' ? checkoutSession.payment_intent : null,
                amount: checkoutSession.amount_total ?? 0,
                currency: checkoutSession.currency ?? 'usd',
                status: checkoutSession.payment_status,
              },
            });

            if (checkoutSession.payment_status === 'paid') {
              await tx.user.update({ where: { id: user.id }, data: { isPaid: true } });
            }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return Response.json({ received: true, duplicate: true });
    }
    console.error('Webhook processing error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
