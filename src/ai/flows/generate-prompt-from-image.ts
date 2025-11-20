
'use server';

/**
 * @fileOverview Generates a descriptive text prompt from an image using a vision-language model.
 *
 * - generatePromptFromImage - A function that analyzes an image and creates a text prompt.
 * - GeneratePromptFromImageInput - The input type for the function.
 * - GeneratePromptFromImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePromptFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePromptFromImageInput = z.infer<typeof GeneratePromptFromImageInputSchema>;

const GeneratePromptFromImageOutputSchema = z.object({
  generatedPrompt: z.string().describe('The rich, descriptive text prompt generated from the image.'),
});
export type GeneratePromptFromImageOutput = z.infer<typeof GeneratePromptFromImageOutputSchema>;

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
