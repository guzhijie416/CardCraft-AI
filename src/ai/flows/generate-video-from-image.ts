
'use server';

/**
 * @fileOverview Generates a short video from a static image and a text prompt using a generative AI model.
 *
 * - generateVideoFromImage - A function that orchestrates the video generation.
 */

import { ai } from '@/ai/genkit';
import type { MediaPart } from 'genkit';
import { GenerateVideoFromImageInputSchema, GenerateVideoFromImageOutputSchema, type GenerateVideoFromImageInput, type GenerateVideoFromImageOutput } from './types';


export async function generateVideoFromImage(
  input: GenerateVideoFromImageInput
): Promise<GenerateVideoFromImageOutput> {
  return generateVideoFromImageFlow(input);
}


async function toBase64(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    // Add API key before fetching the video.
    const videoDownloadResponse = await fetch(
      `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error('Failed to fetch video');
    }

    const buffer = await videoDownloadResponse.buffer();
    const contentType = video.media?.contentType || videoDownloadResponse.headers.get('content-type') || 'video/mp4';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
}


const generateVideoFromImageFlow = ai.defineFlow(
  {
    name: 'generateVideoFromImageFlow',
    inputSchema: GenerateVideoFromImageInputSchema,
    outputSchema: GenerateVideoFromImageOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: [
        {
          text: input.prompt,
        },
        {
          media: {
            url: input.imageUrl,
          },
        },
      ],
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9', // Default for scenes
        personGeneration: 'allow_adult',
      },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // This can take up to a minute, maybe more.
    // In a real app, you might want to increase the server action timeout.
    while (!operation.done) {
        console.log('Checking video generation status...');
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
        console.error('Video generation failed:', operation.error);
        throw new Error('failed to generate video: ' + operation.error.message);
    }
    
    const video = operation.output?.message?.content.find((p: any) => !!p.media);
    if (!video) {
        throw new Error('Failed to find the generated video in the operation output');
    }

    const videoDataUri = await toBase64(video as MediaPart);

    return { videoUrl: videoDataUri };
  }
);
