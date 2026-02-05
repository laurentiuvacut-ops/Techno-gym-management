'use server';
/**
 * @fileOverview A Genkit flow for creating a Stripe Checkout session.
 *
 * - createCheckoutSession - A function that creates and returns a Stripe Checkout session URL.
 * - CreateCheckoutSessionInput - The input type for the createCheckoutSession function.
 */
import 'dotenv/config';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

const CreateCheckoutSessionInputSchema = z.object({
  priceId: z.string().describe('The ID of the Stripe Price object.'),
  userId: z.string().describe('The ID of the user initiating the purchase.'),
  baseUrl: z.string().describe('The base URL of the application for success/cancel redirects.'),
  planId: z.string().describe('The ID of the subscription plan from the app.'),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: z.object({ url: z.string().nullable(), error: z.string().nullable() }),
  },
  async ({ priceId, userId, baseUrl, planId }) => {
    // Explicitly check if the Stripe secret key is loaded.
    if (!process.env.STRIPE_SECRET_KEY) {
      const errorMessage = 'Cheia secretă Stripe (STRIPE_SECRET_KEY) nu este setată. Asigurați-vă că ați creat fișierul .env.local și ați repornit serverul.';
      console.error('Stripe Checkout Session Error:', errorMessage);
      return { url: null, error: errorMessage };
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-04-10',
        typescript: true,
    });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard/plans?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`,
        cancel_url: `${baseUrl}/dashboard/plans`,
        client_reference_id: userId,
      });

      return { url: session.url, error: null };
    } catch (e: any) {
      console.error('Stripe Checkout Session Error:', e.message);
      // Return the specific error message from Stripe to the client.
      return { url: null, error: e.message };
    }
  }
);

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ url: string | null; error: string | null; }> {
  return createCheckoutSessionFlow(input);
}
