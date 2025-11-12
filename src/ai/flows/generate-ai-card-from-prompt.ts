'use server';
/**
 * @fileOverview Generates a unique card design using AI based on a master prompt and a personalized prompt.
 *
 * - generateAiCardFromPrompt - A function that generates an AI card based on prompts.
 * - GenerateAiCardFromPromptInput - The input type for the generateAiCardFromPrompt function.
 * - GenerateAiCardFromPromptOutput - The return type for the generateAiCardFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiCardFromPromptInputSchema = z.object({
  masterPrompt: z.string().describe('A pre-selected master prompt for the overall theme of the card.'),
  personalizedPrompt: z.string().describe('A personalized prompt for specific details of the card design.'),
});
export type GenerateAiCardFromPromptInput = z.infer<typeof GenerateAiCardFromPromptInputSchema>;

const GenerateAiCardFromPromptOutputSchema = z.object({
  cardDataUri: z.string().describe('The generated card as a data URI (e.g., image/png;base64,...).'),
});
export type GenerateAiCardFromPromptOutput = z.infer<typeof GenerateAiCardFromPromptOutputSchema>;

export async function generateAiCardFromPrompt(input: GenerateAiCardFromPromptInput): Promise<GenerateAiCardFromPromptOutput> {
  return generateAiCardFromPromptFlow(input);
}

const generateAiCardPrompt = ai.definePrompt({
  name: 'generateAiCardPrompt',
  input: {schema: GenerateAiCardFromPromptInputSchema},
  output: {schema: GenerateAiCardFromPromptOutputSchema},
  prompt: `Combine the following master prompt and personalized prompt to generate a unique card design. Return the card as a data URI.

Master Prompt: {{{masterPrompt}}}
Personalized Prompt: {{{personalizedPrompt}}}

Card Design: {{media url=cardDataUri}}`,
});

const generateAiCardFromPromptFlow = ai.defineFlow(
  {
    name: 'generateAiCardFromPromptFlow',
    inputSchema: GenerateAiCardFromPromptInputSchema,
    outputSchema: GenerateAiCardFromPromptOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.masterPrompt + ", " + input.personalizedPrompt,
    });
    return {cardDataUri: media.url!};
  }
);
