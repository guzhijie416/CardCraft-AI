'use server';

/**
 * @fileOverview Summarizes and improves a user's personalized prompt for AI card generation.
 *
 * - summarizeAndImproveUserPrompt - A function that handles the prompt summarization and improvement process.
 * - SummarizeAndImproveUserPromptInput - The input type for the summarizeAndImproveUserPrompt function.
 * - SummarizeAndImproveUserPromptOutput - The return type for the summarizeAndImproveUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAndImproveUserPromptInputSchema = z.object({
  userPrompt: z
    .string()
    .describe('The user-provided prompt for generating the AI card.'),
  masterPrompt: z
    .string()
    .describe('The master prompt providing the overall theme for the AI card.'),
});
type SummarizeAndImproveUserPromptInput = z.infer<
  typeof SummarizeAndImproveUserPromptInputSchema
>;

const SummarizeAndImproveUserPromptOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the user prompt, including strengths and areas for improvement.'
    ),
  improvedPrompt: z
    .string()
    .describe('A refined version of the user prompt for better AI generation results.'),
  isGoodPrompt: z.boolean().describe('Whether the original user prompt is high quality.'),
});
type SummarizeAndImproveUserPromptOutput = z.infer<
  typeof SummarizeAndImproveUserPromptOutputSchema
>;

export async function summarizeAndImproveUserPrompt(
  input: SummarizeAndImproveUserPromptInput
): Promise<SummarizeAndImproveUserPromptOutput> {
  return summarizeAndImproveUserPromptFlow(input);
}

const summarizeAndImprovePrompt = ai.definePrompt({
  name: 'summarizeAndImprovePrompt',
  input: {schema: SummarizeAndImproveUserPromptInputSchema},
  output: {schema: SummarizeAndImproveUserPromptOutputSchema},
  prompt: `You are an AI prompt improvement assistant.  You will receive a user prompt and a master prompt used for generating a digital card.  The master prompt provides the overall theme, and the user prompt adds personalized details.

  First, summarize the user's prompt, identifying its strengths and weaknesses.  Be specific and constructive.
  Second, improve the user's prompt based on the master prompt, making it more likely to produce a high-quality card.  The improved prompt should be a refined version of the user's prompt, not a completely new prompt.
  Third, set the isGoodPrompt to true if the user prompt is of high quality and requires no changes, otherwise, set it to false.

  User Prompt: {{{userPrompt}}}
  Master Prompt: {{{masterPrompt}}}

  Summary: 
  Improved Prompt: 
  isGoodPrompt:
  `,
});

const summarizeAndImproveUserPromptFlow = ai.defineFlow(
  {
    name: 'summarizeAndImproveUserPromptFlow',
    inputSchema: SummarizeAndImproveUserPromptInputSchema,
    outputSchema: SummarizeAndImproveUserPromptOutputSchema,
  },
  async input => {
    const {output} = await summarizeAndImprovePrompt(input);
    return output!;
  }
);
