'use server';
/**
 * @fileOverview A Genkit flow for sending feedback notification emails.
 *
 * - sendFeedbackEmail - A function that sends an email with the user's feedback.
 * - SendFeedbackEmailInput - The input type for the sendFeedbackEmail function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

const SendFeedbackEmailInputSchema = z.object({
  rating: z.number().describe('The star rating given by the user (1-5).'),
  comment: z.string().describe('The feedback comment from the user.'),
});
export type SendFeedbackEmailInput = z.infer<typeof SendFeedbackEmailInputSchema>;

const sendFeedbackEmailFlow = ai.defineFlow(
  {
    name: 'sendFeedbackEmailFlow',
    inputSchema: SendFeedbackEmailInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().nullable() }),
  },
  async ({ rating, comment }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.FEEDBACK_EMAIL_TO;
    const from = process.env.FEEDBACK_EMAIL_FROM;

    if (!apiKey || apiKey === 'INLOCUITI_CU_CHEIA_API_DE_LA_RESEND' || !to || !from) {
      const errorMessage = 'Variabilele de mediu pentru Resend nu sunt configurate. Emailul nu a fost trimis.';
      console.warn('sendFeedbackEmailFlow:', errorMessage);
      // We return success: true because failing to send an email should not be a critical error for the user.
      // The feedback was already saved to the database.
      return { success: true, error: errorMessage };
    }

    try {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: from,
        to: to,
        subject: `Feedback Nou Primit: ${rating} Stele ★`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #333;">Feedback Nou Techno Gym</h1>
            <p style="font-size: 16px;">Ați primit un nou feedback de la un membru.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #17a2b8; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; font-size: 24px; color: #ffc107;">
                ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
              </p>
              <p style="margin-top: 10px; font-style: italic; color: #555;">"${comment}"</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">Acesta este un e-mail automat. Nu este necesar să răspundeți.</p>
          </div>
        `,
      });

      return { success: true, error: null };
    } catch (e: any) {
      console.error('Resend API Error:', e.message);
      // We return success: true here as well for the same reason as above.
      return { success: true, error: e.message };
    }
  }
);

export async function sendFeedbackEmail(
  input: SendFeedbackEmailInput
): Promise<{ success: boolean; error: string | null; }> {
  return sendFeedbackEmailFlow(input);
}
