'use server';

/**
 * @fileOverview Generates a refined, high-quality prompt for image generation based on user input and selected style options.
 *
 * - generateRefinedPrompt - A function that orchestrates the prompt refinement.
 * - GenerateRefinedPromptInput - The input type for the function.
 * - GenerateRefinedPromptOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRefinedPromptInputSchema = z.object({
  basePrompt: z.string().describe('The user\'s initial, basic description of what they want to create.'),
  artisticMedium: z.string().optional().describe('e.g., "watercolor painting", "oil painting", "charcoal sketch", "vintage postcard".'),
  colorPalette: z.string().optional().describe('e.g., "a soft pastel color palette", "vibrant and bold colors", "warm and earthy palette".'),
  composition: z.string().optional().describe('e.g., "close-up portrait", "cinematic wide shot", "symmetrical composition".'),
  lighting: z.string().optional().describe('e.g., "soft diffused lighting", "dramatic, high-contrast lighting", "golden hour glow".'),
  texture: z.string().optional().describe('e.g., "textured paper", "embossed details", "gold foil accents".'),
});
type GenerateRefinedPromptInput = z.infer<typeof GenerateRefinedPromptInputSchema>;

const GenerateRefinedPromptOutputSchema = z.object({
  refinedPrompt: z.string().describe('The detailed, high-quality prompt suitable for an image generation model.'),
});
type GenerateRefinedPromptOutput = z.infer<typeof GenerateRefinedPromptOutputSchema>;

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
