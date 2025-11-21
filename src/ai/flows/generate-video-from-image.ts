
'use server';

/**
 * @fileOverview Generates a short video by animating a static image based on a text prompt.
 *
 * - generateVideoFromImage - A function that animates an image.
 * - GenerateVideoFromImageInput - The input type for the function.
 * - GenerateVideoFromImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MediaPart } from 'genkit/media';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateVideoFromImageInputSchema = z.object({
  baseImageUri: z
    .string()
    .describe(
      "The static image to animate, as a data URI (e.g., image/png;base64,...)."
    ),
  animationPrompt: z.string().describe('A short description of the desired animation (e.g., "add falling snow").'),
});
export type GenerateVideoFromImageInput = z.infer<typeof GenerateVideoFromImageInputSchema>;

const GenerateVideoFromImageOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI (video/mp4;base64,...).'),
});
export type GenerateVideoFromImageOutput = z.infer<typeof GenerateVideoFromImageOutputSchema>;

async function downloadVideo(video: MediaPart): Promise<Buffer> {
    if (!video.media?.url) {
        throw new Error('No video URL found in the media part.');
    }

    const fetch = (await import('node-fetch')).default;
    // Add API key before fetching the video.
    const videoDownloadResponse = await fetch(
        `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (!videoDownloadResponse || !videoDownloadResponse.ok) {
        throw new Error(`Failed to fetch video. Status: ${videoDownloadResponse.status} ${videoDownloadResponse.statusText}`);
    }

    return videoDownloadResponse.buffer();
}


const generateVideoFromImageFlow = ai.defineFlow(
  {
    name: 'generateVideoFromImageFlow',
    inputSchema: GenerateVideoFromImageInputSchema,
    outputSchema: GenerateVideoFromImageOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: [
            {
                text: `Animate the provided image with the following effect: ${input.animationPrompt}. The animation should be subtle and elegant.`,
            },
            {
                media: {
                    url: input.baseImageUri,
                },
            },
        ],
        config: {
            durationSeconds: 5,
            aspectRatio: '9:16',
        },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // Poll for completion
    while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
    }
    
    const videoPart = operation.output?.message?.content.find((p: any) => !!p.media) as MediaPart | undefined;
    if (!videoPart || !videoPart.media?.url) {
        throw new Error('Failed to find the generated video in the operation result');
    }

    const videoBuffer = await downloadVideo(videoPart);
    const videoBase64 = videoBuffer.toString('base64');

    return { videoDataUri: `data:video/mp4;base64,${videoBase64}` };
  }
);


export async function generateVideoFromImage(
  input: GenerateVideoFromImageInput
): Promise<GenerateVideoFromImageOutput> {
  return generateVideoFromImageFlow(input);
}
