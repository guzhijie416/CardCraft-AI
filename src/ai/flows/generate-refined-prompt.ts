
'use server';

/**
 * @fileOverview Generates a refined, high-quality prompt for image generation based on user input and selected style options.
 *
 * - generateRefinedPrompt - A function that orchestrates the prompt refinement.
 */

import { ai } from '@/ai/genkit';
import { GenerateRefinedPromptInputSchema, GenerateRefinedPromptOutputSchema, type GenerateRefinedPromptInput, type GenerateRefinedPromptOutput } from './types';


export async function generateRefinedPrompt(
  input: GenerateRefinedPromptInput
): Promise<GenerateRefinedPromptOutput> {
  return generateRefinedPromptFlow(input);
}

const refinePrompt = ai.definePrompt({
  name: 'generateRefinedPrompt',
  input: { schema: GenerateRefinedPromptInputSchema },
  output: { schema: GenerateRefinedPromptOutputSchema },
  prompt: `You are an expert AI Prompt Engineer specializing in image generation. Your task is to transform a user's basic idea into a rich, detailed, and effective prompt for a text-to-image model.

Combine the user's base prompt with any selected refinement options to create a single, cohesive, and descriptive paragraph. Do not just list the options; weave them naturally into the description.

User's Base Prompt: {{{basePrompt}}}

Refinement Options to include (if provided):
{{#if artisticMedium}}- Artistic Style/Medium: {{{artisticMedium}}}{{/if}}
{{#if colorPalette}}- Color Palette: {{{colorPalette}}}{{/if}}
{{#if composition}}- Composition/Framing: {{{composition}}}{{/if}}
{{#if lighting}}- Lighting: {{{lighting}}}{{/if}}
{{#if texture}}- Texture/Details: {{{texture}}}{{/if}}

Generate the final, refined prompt as a single string in the 'refinedPrompt' field.
`,
});

const generateRefinedPromptFlow = ai.defineFlow(
  {
    name: 'generateRefinedPromptFlow',
    inputSchema: GenerateRefinedPromptInputSchema,
    outputSchema: GenerateRefinedPromptOutputSchema,
  },
  async (input) => {
    const { output } = await refinePrompt(input);
    return output!;
  }
);
