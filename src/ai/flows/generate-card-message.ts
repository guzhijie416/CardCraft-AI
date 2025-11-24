
'use server';

/**
 * @fileOverview Generates suggested messages for a digital card based on a prompt.
 *
 * - generateCardMessage - A function that generates message suggestions.
 */

import { ai } from '@/ai/genkit';
import { GenerateCardMessageInputSchema, GenerateCardMessageOutputSchema, type GenerateCardMessageInput, type GenerateCardMessageOutput } from './types';


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
