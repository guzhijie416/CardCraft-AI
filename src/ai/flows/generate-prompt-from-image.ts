
'use server';

/**
 * @fileOverview Generates a descriptive text prompt from an image using a vision-language model.
 *
 * - generatePromptFromImage - A function that analyzes an image and creates a text prompt.
 */

import { ai } from '@/ai/genkit';
import { GeneratePromptFromImageInputSchema, GeneratePromptFromImageOutputSchema, type GeneratePromptFromImageInput, type GeneratePromptFromImageOutput } from './types';


export async function generatePromptFromImage(
  input: GeneratePromptFromImageInput
): Promise<GeneratePromptFromImageOutput> {
  return generatePromptFromImageFlow(input);
}

const fromImagePrompt = ai.definePrompt({
  name: 'generatePromptFromImagePrompt',
  input: { schema: GeneratePromptFromImageInputSchema },
  output: { schema: GeneratePromptFromImageOutputSchema },
  prompt: `You are an expert prompt engineer for text-to-image models. Analyze the following image and generate a single, rich, detailed, and descriptive text prompt that would allow an AI image generator to recreate a similar image.

Describe the subject, the setting, the artistic style (e.g., 'watercolor painting', 'photorealistic', 'art deco'), the color palette, the composition, and the overall mood of the image. Combine these elements into a single, cohesive paragraph.

Image: {{media url=photoDataUri}}
`,
});

const generatePromptFromImageFlow = ai.defineFlow(
  {
    name: 'generatePromptFromImageFlow',
    inputSchema: GeneratePromptFromImageInputSchema,
    outputSchema: GeneratePromptFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await fromImagePrompt(input);
    return output!;
  }
);
