
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

// Helper function to extract content type from a data URI
function getContentTypeFromDataUri(dataUri: string): string | null {
  const match = dataUri.match(/^data:(.*?);/);
  return match ? match[1] : null;
}


const generateVideoFromImageFlow = ai.defineFlow(
  {
    name: 'generateVideoFromImageFlow',
    inputSchema: GenerateVideoFromImageInputSchema,
    outputSchema: GenerateVideoFromImageOutputSchema,
  },
  async (input) => {
    
    const contentType = getContentTypeFromDataUri(input.imageUrl);
    if (!contentType) {
      throw new Error('Could not determine content type from image data URI.');
    }
    
    let { operation } = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: [
        {
          text: input.prompt,
        },
        {
          media: {
            url: input.imageUrl,
            contentType: contentType, // This is the critical fix
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
    
    // The URL from VEO is temporary and requires an API key. 
    // We must fetch it on the server and convert it to a permanent Base64 Data URI.
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
    const videoContentType = video.media?.contentType || videoDownloadResponse.headers.get('content-type') || 'video/mp4';
    const videoDataUri = `data:${videoContentType};base64,${Buffer.from(buffer).toString('base64')}`;

    return { videoUrl: videoDataUri };
  }
);

