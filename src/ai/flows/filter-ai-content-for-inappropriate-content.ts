'use server';

/**
 * @fileOverview A flow to filter AI-generated content for inappropriate or harmful content.
 *
 * - filterAIContent - A function that filters the given AI-generated content.
 * - FilterAIContentInput - The input type for the filterAIContent function.
 * - FilterAIContentOutput - The return type for the filterAIContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterAIContentInputSchema = z.object({
  content: z
    .string()
    .describe('The AI-generated content to be checked for safety.'),
});
type FilterAIContentInput = z.infer<typeof FilterAIContentInputSchema>;

const FilterAIContentOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe(
      'Whether the content is safe and does not violate any safety guidelines.'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason why the content was considered unsafe.'),
});
type FilterAIContentOutput = z.infer<typeof FilterAIContentOutputSchema>;

export async function filterAIContent(input: FilterAIContentInput): Promise<FilterAIContentOutput> {
  return filterAIContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterAIContentPrompt',
  input: {schema: FilterAIContentInputSchema},
  output: {schema: FilterAIContentOutputSchema},
  prompt: `You are an AI safety expert. Your task is to determine if the provided content is safe for general consumption.

  Content: {{{content}}}

  Respond with a JSON object that contains the following:
  - isSafe: true if the content is safe, false otherwise.
  - reason: If isSafe is false, provide a brief explanation of why the content is considered unsafe.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const filterAIContentFlow = ai.defineFlow(
  {
    name: 'filterAIContentFlow',
    inputSchema: FilterAIContentInputSchema,
    outputSchema: FilterAIContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
