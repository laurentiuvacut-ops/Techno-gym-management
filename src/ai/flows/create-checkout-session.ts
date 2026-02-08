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
  userId: z.string().describe('The ID of the user initiating the purchase.'),
  baseUrl: z.string().describe('The base URL of the application for success/cancel redirects.'),
  planId: z.string().describe('The ID of the subscription plan from the app.'),
  planTitle: z.string().describe('The title of the subscription plan.'),
  planPrice: z.string().describe('The price string of the plan (e.g., "150 RON").'),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: z.object({ url: z.string().nullable(), error: z.string().nullable() }),
  },
  async ({ userId, baseUrl, planId, planTitle, planPrice }) => {
    // Explicitly check if the Stripe secret key is loaded.
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'INLOCUITI_CU_CHEIA_SECRETA_DE_LA_STRIPE') {
      const errorMessage = 'Cheia secretă Stripe (STRIPE_SECRET_KEY) nu este setată. Asigurați-vă că ați creat fișierul .env.local și ați repornit serverul.';
      console.error('Stripe Checkout Session Error:', errorMessage);
      return { url: null, error: errorMessage };
    }
    
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-06-20',
          typescript: true,
      });

      // Parse amount from price string (e.g., "150 RON") to smallest currency unit (bani)
      const amount = parseInt(planPrice.split(' ')[0]) * 100;
      if (isNaN(amount)) {
        return { url: null, error: `Formatul prețului "${planPrice}" este invalid.` };
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'ron',
              product_data: {
                name: planTitle,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/dashboard/plans?plan_id=${planId}&payment_success=true`,
        cancel_url: `${baseUrl}/dashboard/plans`,
        client_reference_id: userId,
      });

      // Defensive check: ensure the session object has a URL.
      if (!session.url) {
        console.error("Stripe session was created, but it did not contain a URL.", session);
        return { url: null, error: "Eroare Stripe: Sesiunea a fost creată, dar nu a fost returnat un URL de plată. Acest lucru se poate întâmpla dacă există o problemă de configurare a contului." };
      }

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
