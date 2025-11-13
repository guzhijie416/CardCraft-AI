'use server';

/**
 * @fileOverview Generates suggested messages for a digital card based on a prompt.
 *
 * - generateCardMessage - A function that generates message suggestions.
 * - GenerateCardMessageInput - The input type for the function.
 * - GenerateCardMessageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCardMessageInputSchema = z.object({
  prompt: z.string().describe('The prompt to guide the message generation. This can be a master prompt or a custom user prompt.'),
  occasion: z.string().describe('The occasion for the card (e.g., "birthday", "wedding") to provide context.'),
});
export type GenerateCardMessageInput = z.infer<typeof GenerateCardMessageInputSchema>;

const GenerateCardMessageOutputSchema = z.object({
  messages: z.array(z.string()).describe('An array of 3-5 generated message suggestions.'),
});
export type GenerateCardMessageOutput = z.infer<typeof GenerateCardMessageOutputSchema>;

export async function generateCardMessage(
  input: GenerateCardMessageInput
): Promise<GenerateCardMessageOutput> {
  return generateCardMessageFlow(input);
}

const messageGenerationPrompt = ai.definePrompt({
  name: 'generateCardMessagePrompt',
  input: { schema: GenerateCardMessageInputSchema },
  output: { schema: GenerateCardMessageOutputSchema },
  prompt: `You are an expert greeting card writer. Your task is to generate a few distinct, high-quality message suggestions for a digital card.

  The occasion for the card is: {{{occasion}}}
  The user's request for the message is: {{{prompt}}}

  Please generate 3 to 5 distinct message options. Return the messages as a JSON object with a "messages" array.
  `,
});

const generateCardMessageFlow = ai.defineFlow(
  {
    name: 'generateCardMessageFlow',
    inputSchema: GenerateCardMessageInputSchema,
    outputSchema: GenerateCardMessageOutputSchema,
  },
  async (input) => {
    const { output } = await messageGenerationPrompt(input);
    return output!;
  }
);
