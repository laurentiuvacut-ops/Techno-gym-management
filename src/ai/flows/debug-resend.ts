'use server';
/**
 * @fileOverview A Genkit flow for diagnosing Resend email configuration.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

const DebugResendOutputSchema = z.object({
  apiKeyFound: z.boolean(),
  toEmailFound: z.boolean(),
  fromEmailFound: z.boolean(),
  sendSuccess: z.boolean(),
  errorMessage: z.string().nullable(),
  resendError: z.string().nullable(),
});
export type DebugResendOutput = z.infer<typeof DebugResendOutputSchema>;

const debugResendConfigFlow = ai.defineFlow(
  {
    name: 'debugResendConfigFlow',
    inputSchema: z.void(),
    outputSchema: DebugResendOutputSchema,
  },
  async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.FEEDBACK_EMAIL_TO;
    const from = process.env.FEEDBACK_EMAIL_FROM;

    const result: DebugResendOutput = {
      apiKeyFound: !!apiKey && apiKey !== 'INLOCUITI_CU_CHEIA_API_DE_LA_RESEND',
      toEmailFound: !!to,
      fromEmailFound: !!from,
      sendSuccess: false,
      errorMessage: null,
      resendError: null,
    };

    if (!result.apiKeyFound || !result.toEmailFound || !result.fromEmailFound) {
      let missingVars = [];
      if (!result.apiKeyFound) missingVars.push('RESEND_API_KEY');
      if (!result.toEmailFound) missingVars.push('FEEDBACK_EMAIL_TO');
      if (!result.fromEmailFound) missingVars.push('FEEDBACK_EMAIL_FROM');
      result.errorMessage = `Variabile de mediu lipsă sau incorecte: ${missingVars.join(', ')}. Asigură-te că sunt definite în fișierul .env.local și că ai repornit serverul.`;
      return result;
    }

    try {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: from!,
        to: to!,
        subject: 'Test Resend - Techno Gym',
        html: '<p>Acesta este un e-mail de test pentru a verifica configurarea Resend.</p>',
      });

      if (error) {
        result.sendSuccess = false;
        result.resendError = error.message;
        result.errorMessage = `Resend a returnat o eroare.`;
      } else {
        result.sendSuccess = true;
      }
    } catch (e: any) {
      result.sendSuccess = false;
      result.errorMessage = `A apărut o eroare la trimiterea e-mailului.`;
      result.resendError = e.message;
    }
    
    return result;
  }
);

export async function debugResendConfig(): Promise<DebugResendOutput> {
  return debugResendConfigFlow();
}
