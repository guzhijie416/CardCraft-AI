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
  photoDataUri: z.string().optional().describe("An optional photo of a user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This can be a style reference image."),
});
export type GenerateAiCardFromPromptInput = z.infer<typeof GenerateAiCardFromPromptInputSchema>;

const GenerateAiCardFromPromptOutputSchema = z.object({
  cardDataUri: z.string().describe('The generated card as a data URI (e.g., image/png;base64,...).'),
});
export type GenerateAiCardFromPromptOutput = z.infer<typeof GenerateAiCardFromPromptOutputSchema>;

export async function generateAiCardFromPrompt(input: GenerateAiCardFromPromptInput): Promise<GenerateAiCardFromPromptOutput> {
  return generateAiCardFromPromptFlow(input);
}

const generateAiCardFromPromptFlow = ai.defineFlow(
  {
    name: 'generateAiCardFromPromptFlow',
    inputSchema: GenerateAiCardFromPromptInputSchema,
    outputSchema: GenerateAiCardFromPromptOutputSchema,
  },
  async (input) => {
    let prompt;
    let model = 'googleai/imagen-4.0-fast-generate-001';
    let config;

    if (input.photoDataUri) {
        model = 'googleai/gemini-2.5-flash-image-preview';
        prompt = [
            { media: { url: input.photoDataUri } },
            // Add a specific instruction for style transfer
            { text: `Use the provided image as a style reference for the following prompt: ${input.masterPrompt}, ${input.personalizedPrompt}` },
        ];
        config = {
            responseModalities: ['TEXT', 'IMAGE'],
        };
    } else {
        prompt = `${input.masterPrompt}, ${input.personalizedPrompt}`;
    }
    
    const generationRequest: any = { model, prompt };
    if (config) {
      generationRequest.config = config;
    }

    const { media } = await ai.generate(generationRequest);
    return { cardDataUri: media.url! };
  }
);
