'use server';
/**
 * @fileOverview A Genkit flow for debugging Stripe configuration.
 * - getStripeConfigStatus - Checks if the Stripe secret key is set on the server.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function getStripeConfigStatus(): Promise<{ isSecretKeySet: boolean }> {
  return getStripeConfigStatusFlow();
}

const getStripeConfigStatusFlow = ai.defineFlow(
  {
    name: 'getStripeConfigStatusFlow',
    inputSchema: z.void(),
    outputSchema: z.object({ isSecretKeySet: z.boolean() }),
  },
  async () => {
    // Explicitly check if the Stripe secret key is loaded and not the placeholder.
    const isSet = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'INLOCUITI_CU_CHEIA_SECRETA_DE_LA_STRIPE';
    return { isSecretKeySet: isSet };
  }
);
