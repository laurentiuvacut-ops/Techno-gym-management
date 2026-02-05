'use server';
/**
 * @fileOverview A Genkit flow for creating a Stripe Checkout session.
 *
 * - createCheckoutSession - A function that creates and returns a Stripe Checkout session URL.
 * - CreateCheckoutSessionInput - The input type for the createCheckoutSession function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

const CreateCheckoutSessionInputSchema = z.object({
  priceId: z.string().describe('The ID of the Stripe Price object.'),
  userId: z.string().describe('The ID of the user initiating the purchase.'),
  baseUrl: z.string().describe('The base URL of the application for success/cancel redirects.'),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

// Initialize Stripe with the secret key from environment variables.
// IMPORTANT: The user must create a .env.local file with STRIPE_SECRET_KEY.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});

const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: z.object({ url: z.string().nullable() }),
  },
  async ({ priceId, userId, baseUrl }) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription', // Use 'payment' for one-time purchases
        success_url: `${baseUrl}/dashboard/plans?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard/plans`,
        client_reference_id: userId, // Link the session to the user for webhook reconciliation
      });

      return { url: session.url };
    } catch (e: any) {
      console.error('Stripe Checkout Session Error:', e.message);
      return { url: null };
    }
  }
);

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ url: string | null }> {
  return createCheckoutSessionFlow(input);
}
