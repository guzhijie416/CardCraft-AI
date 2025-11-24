
'use server';

/**
 * @fileOverview Summarizes and improves a user's personalized prompt for AI card generation.
 *
 * - summarizeAndImproveUserPrompt - A function that handles the prompt summarization and improvement process.
 */

import {ai} from '@/ai/genkit';
import { SummarizeAndImproveUserPromptInputSchema, SummarizeAndImproveUserPromptOutputSchema, type SummarizeAndImproveUserPromptInput, type SummarizeAndImproveUserPromptOutput } from './types';


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
