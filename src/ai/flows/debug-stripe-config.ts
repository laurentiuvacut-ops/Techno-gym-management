'use server';
/**
 * @fileOverview A Genkit flow for checking Stripe configuration.
 *
 * - debugStripeConfig - A function that checks for the Stripe secret key.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const StripeDebugStatusSchema = z.object({
  secretKeyFound: z.boolean(),
  status: z.string(),
  error: z.string().nullable(),
});
export type StripeDebugStatus = z.infer<typeof StripeDebugStatusSchema>;

const debugStripeConfigFlow = ai.defineFlow(
  {
    name: 'debugStripeConfigFlow',
    inputSchema: z.null(),
    outputSchema: StripeDebugStatusSchema,
  },
  async () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    const secretKeyFound = !!secretKey && secretKey !== 'INLOCUITI_CU_CHEIA_SECRETA_DE_LA_STRIPE';

    if (!secretKeyFound) {
      return {
        secretKeyFound: false,
        status: 'Configurare Incompletă',
        error: 'Cheia secretă Stripe (STRIPE_SECRET_KEY) lipsește din fișierul .env.local sau este incorectă. Asigurați-vă că ați repornit serverul după ce ați adăugat-o.',
      };
    }

    // We don't try to make an API call to avoid charges or complex checks.
    // The simple presence of the key is a good first step.
    return {
      secretKeyFound: true,
      status: 'Succes',
      error: 'Cheia secretă a fost găsită. Dacă plățile eșuează în continuare, cheia ar putea fi invalidă sau contul Stripe ar putea avea probleme de configurare.',
    };
  }
);

export async function debugStripeConfig(): Promise<StripeDebugStatus> {
  return debugStripeConfigFlow(null);
}
