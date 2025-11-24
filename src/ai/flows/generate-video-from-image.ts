
'use server';

/**
 * @fileOverview Generates a short video from a static image and a text prompt using a generative AI model.
 *
 * - generateVideoFromImage - A function that orchestrates the video generation.
 */

import { ai } from '@/ai/genkit';
import { GenerateVideoFromImageInputSchema, GenerateVideoFromImageOutputSchema, type GenerateVideoFromImageInput, type GenerateVideoFromImageOutput } from './types';

export async function generateVideoFromImage(
  input: GenerateVideoFromImageInput
): Promise<GenerateVideoFromImageOutput> {
  return generateVideoFromImageFlow(input);
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
        aspectRatio: '16:9',
        personGeneration: 'allow_adult',
      },
    });

    if (!operation) {
        throw new Error('Expected the model to return an operation');
    }

    // Poll for the result of the long-running operation.
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
    if (!video || !video.media?.url) {
        throw new Error('Failed to find the generated video in the operation output');
    }
    
    // The URL from VEO is temporary. We fetch the raw video data and convert it to a
    // permanent Base64 Data URI to send to the client. This must be done on the server.
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    
    const videoDownloadResponse = await fetch(
      `${video.media.url}&key=${apiKey}`
    );

     if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error(`Failed to download video from temporary URL. Status: ${videoDownloadResponse.status}`);
    }

    const buffer = await videoDownloadResponse.arrayBuffer();
    const contentType = video.media?.contentType || videoDownloadResponse.headers.get('content-type') || 'video/mp4';
    const videoDataUri = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;

    return { videoUrl: videoDataUri };
  }
);
