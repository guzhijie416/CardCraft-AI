
'use server';

/**
 * @fileOverview Generates a short video from a static image and a text prompt using a generative AI model.
 *
 * - generateVideoFromImage - A function that orchestrates the video generation.
 * - GenerateVideoFromImageInput - The input type for the function.
 * - GenerateVideoFromImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs';
import { Readable } from 'stream';
import type { MediaPart } from 'genkit';


const GenerateVideoFromImageInputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The static image to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('A text prompt describing the desired animation (e.g., "make the stars twinkle", "add falling confetti").'),
});
export type GenerateVideoFromImageInput = z.infer<typeof GenerateVideoFromImageInputSchema>;

const GenerateVideoFromImageOutputSchema = z.object({
  videoUrl: z.string().describe('The data URI of the generated video.'),
});
export type GenerateVideoFromImageOutput = z.infer<typeof GenerateVideoFromImageOutputSchema>;


export async function generateVideoFromImage(
  input: GenerateVideoFromImageInput
): Promise<GenerateVideoFromImageOutput> {
  return generateVideoFromImageFlow(input);
}


async function downloadVideo(video: MediaPart): Promise<string> {
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
    const contentType = videoDownloadResponse.headers.get('content-type') || 'video/mp4';
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
        await new Promise((resolve) => setTimeout(resolve, 5000));
        operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
    }
    
    const video = operation.output?.message?.content.find((p: any) => !!p.media);
    if (!video) {
        throw new Error('Failed to find the generated video in the operation output');
    }

    const videoDataUri = await downloadVideo(video as MediaPart);

    return { videoUrl: videoDataUri };
  }
);
