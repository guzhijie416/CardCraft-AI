
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
  photoDataUri: z.string().optional().describe("An optional photo of a user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This can be a style reference image or a base image for modification."),
  modificationStrength: z.number().optional().describe('A value from 0 to 1 indicating the desired strength of image modification. 0.1-0.4 for minor changes, 0.6-0.9 for major transformations.'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16']).optional().describe('The desired aspect ratio for the generated image.'),
  layoutLock: z.boolean().optional().describe('If true, lock the composition of the provided image and apply the prompt as a new theme.')
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
    let model: string;
    let config: any = {};
    let prompt: any;

    if (input.photoDataUri) {
        // This is an image-to-image or style-transfer request
        model = 'googleai/gemini-2.5-flash-image-preview';
        config = { responseModalities: ['IMAGE'] };
        
        let instructionText = '';
        if (input.layoutLock) {
            instructionText = `Use the exact composition and layout of the provided image as a structural guide, but replace the subject and style entirely based on the following text: ${input.personalizedPrompt}`;
        } else if (input.modificationStrength !== undefined) {
          // This is an img2img modification request
          if (input.modificationStrength <= 0.5) {
            instructionText = `Perform minor modifications on the provided image based on the following instruction: ${input.personalizedPrompt}. Keep the original composition and subjects largely intact.`;
          } else {
            instructionText = `Perform a major transformation on the provided image based on the following instruction: ${input.personalizedPrompt}. Use the original image as a base for composition, but take significant creative liberties.`;
          }
        } else {
          // This is a style transfer request
          instructionText = `Analyze the artistic style, color palette, and composition of the provided image. Then, generate a new image that applies that exact style to the following subject: ${input.masterPrompt}, ${input.personalizedPrompt}`;
        }
        
        prompt = [
            { media: { url: input.photoDataUri } },
            { text: instructionText },
        ];

    } else {
        // This is a standard text-to-image request
        model = 'googleai/imagen-4.0-fast-generate-001';
        prompt = `${input.masterPrompt}, ${input.personalizedPrompt}`;
    }
    
    if (input.aspectRatio) {
        config.aspectRatio = input.aspectRatio;
    }
    
    const { media } = await ai.generate({
      model: model,
      prompt: prompt,
      config: config,
    });

    if (!media || !media.url) {
      throw new Error("The AI model did not return an image. Please try again.");
    }

    return { cardDataUri: media.url };
  }
);

