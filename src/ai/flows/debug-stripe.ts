'use server';
/**
 * @fileOverview A Genkit flow for diagnosing Stripe configuration.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DebugStripeOutputSchema = z.object({
  secretKeyFound: z.boolean(),
  errorMessage: z.string().nullable(),
});
export type DebugStripeOutput = z.infer<typeof DebugStripeOutputSchema>;

const debugStripeConfigFlow = ai.defineFlow(
  {
    name: 'debugStripeConfigFlow',
    inputSchema: z.void(),
    outputSchema: DebugStripeOutputSchema,
  },
  async () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    const result: DebugStripeOutput = {
      secretKeyFound: !!secretKey && secretKey !== 'INLOCUITI_CU_CHEIA_SECRETA_DE_LA_STRIPE',
      errorMessage: null,
    };

    if (!result.secretKeyFound) {
      result.errorMessage = 'Variabila de mediu STRIPE_SECRET_KEY lipsește sau nu este setată. Asigură-te că este definită în fișierul .env.local și că ai repornit serverul.';
    }
    
    return result;
  }
);

export async function debugStripeConfig(): Promise<DebugStripeOutput> {
  return debugStripeConfigFlow();
}
