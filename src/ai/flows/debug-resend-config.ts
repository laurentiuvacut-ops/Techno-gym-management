'use server';
/**
 * @fileOverview A Genkit flow for sending a test email to debug Resend configuration.
 *
 * - debugResendConfig - A function that attempts to send a test email and returns a detailed status.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

export const DebugStatusSchema = z.object({
  env: z.object({
    apiKeyFound: z.boolean(),
    toAddressFound: z.boolean(),
    fromAddressFound: z.boolean(),
  }),
  status: z.string(),
  error: z.string().nullable(),
  to: z.string().nullable(),
  from: z.string().nullable(),
});
export type DebugStatus = z.infer<typeof DebugStatusSchema>;

const debugResendConfigFlow = ai.defineFlow(
  {
    name: 'debugResendConfigFlow',
    inputSchema: z.null(),
    outputSchema: DebugStatusSchema,
  },
  async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.FEEDBACK_EMAIL_TO;
    const from = process.env.FEEDBACK_EMAIL_FROM;

    const envStatus = {
      apiKeyFound: !!apiKey && apiKey !== 'INLOCUITI_CU_CHEIA_API_DE_LA_RESEND',
      toAddressFound: !!to,
      fromAddressFound: !!from,
    };

    if (!envStatus.apiKeyFound || !envStatus.toAddressFound || !envStatus.fromAddressFound) {
      return {
        env: envStatus,
        status: 'Configurare Incompletă',
        error: 'Una sau mai multe variabile de mediu (RESEND_API_KEY, FEEDBACK_EMAIL_TO, FEEDBACK_EMAIL_FROM) lipsesc din fișierul .env.local sau sunt incorecte. Asigurați-vă că ați repornit serverul după ce le-ați adăugat.',
        to: to || null,
        from: from || null,
      };
    }

    try {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: from,
        to: to,
        subject: 'Test E-mail de la Techno Gym',
        html: '<p>Felicitări! Ai configurat cu succes Resend. Acum vei primi notificări de feedback.</p>',
      });

      return {
        env: envStatus,
        status: 'Succes',
        error: null,
        to: to,
        from: from,
      };
    } catch (e: any) {
      console.error('Resend Test Email Error:', e.message);
      return {
        env: envStatus,
        status: 'Eroare la Trimitere',
        error: e.message || 'A apărut o eroare necunoscută. Verificați consola pentru detalii.',
        to: to,
        from: from,
      };
    }
  }
);

export async function debugResendConfig(): Promise<DebugStatus> {
  return debugResendConfigFlow(null);
}
