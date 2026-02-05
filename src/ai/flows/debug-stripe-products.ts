'use server';
/**
 * @fileOverview A Genkit flow for advanced debugging of Stripe products and prices.
 * - debugStripeProducts - Compares products/prices in `data.ts` with the Stripe account.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';
import { subscriptions } from '@/lib/data';

export async function debugStripeProducts(): Promise<{
  isKeyValid: boolean;
  error?: string;
  mismatchedPrices: string[];
  inactivePrices: string[];
}> {
  return debugStripeProductsFlow();
}

const debugStripeProductsFlow = ai.defineFlow(
  {
    name: 'debugStripeProductsFlow',
    inputSchema: z.void(),
    outputSchema: z.object({
      isKeyValid: z.boolean(),
      error: z.string().optional(),
      mismatchedPrices: z.array(z.string()),
      inactivePrices: z.array(z.string()),
    }),
  },
  async () => {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'INLOCUITI_CU_CHEIA_SECRETA_DE_LA_STRIPE') {
      return { isKeyValid: false, error: 'STRIPE_SECRET_KEY nu este setată.', mismatchedPrices: [], inactivePrices: [] };
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
        typescript: true,
      });

      // Fetch all prices from Stripe
      const stripePrices = await stripe.prices.list({ limit: 100 });
      
      const allStripePriceIds = stripePrices.data.map(p => p.id);
      const activeStripePriceIds = stripePrices.data.filter(p => p.active).map(p => p.id);

      const localPriceIds = subscriptions.map(s => s.stripePriceId).filter(id => id && !id.includes('placeholder'));
      
      // Prices in data.ts that are NOT found at all in Stripe
      const mismatchedPrices = localPriceIds.filter(id => !allStripePriceIds.includes(id));

      // Prices in data.ts that ARE found in Stripe, but are not active
      const inactivePrices = localPriceIds.filter(id => allStripePriceIds.includes(id) && !activeStripePriceIds.includes(id));


      return {
        isKeyValid: true,
        mismatchedPrices: mismatchedPrices,
        inactivePrices: inactivePrices,
      };

    } catch (e: any) {
        if (e.type === 'StripeAuthenticationError') {
            return { isKeyValid: false, error: 'Cheia secretă Stripe este invalidă. Asigurați-vă că este copiată corect din modul Test.', mismatchedPrices: [], inactivePrices: [] };
        }
      return { isKeyValid: false, error: e.message, mismatchedPrices: [], inactivePrices: [] };
    }
  }
);
