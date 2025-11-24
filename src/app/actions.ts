
'use server';

import { generateAiCardFromPrompt, type GenerateAiCardFromPromptInput } from '@/ai/flows/generate-ai-card-from-prompt';
import { generateCardMessage } from '@/ai/flows/generate-card-message';
import { generateMemePrompt } from '@/ai/flows/generate-meme-prompt';
import { generatePromptFromImage } from '@/ai/flows/generate-prompt-from-image';
import { generateRefinedPrompt } from '@/ai/flows/generate-refined-prompt';
import { summarizeAndImproveUserPrompt } from '@/ai/flows/summarize-and-improve-user-prompt';
import { filterAIContent } from '@/ai/flows/filter-ai-content-for-inappropriate-content';
import { generateVideoFromImage } from '@/ai/flows/generate-video-from-image';
import type { GenerateCardMessageInput } from '@/ai/flows/types';
import type { GenerateMemePromptInput } from '@/ai/flows/types';
import type { GeneratePromptFromImageInput } from '@/ai/flows/types';
import type { GenerateRefinedPromptInput } from '@/ai/flows/types';
import type { SummarizeAndImproveUserPromptInput } from '@/ai/flows/types';
import type { FilterAIContentInput } from '@/ai/flows/types';
import type { GenerateVideoFromImageInput } from '@/ai/flows/types';


export async function analyzePromptAction(input: SummarizeAndImproveUserPromptInput) {
  try {
    return await summarizeAndImproveUserPrompt(input);
  } catch (error) {
    console.error('Error in analyzePromptAction:', error);
    throw new Error('Failed to analyze the prompt.');
  }
}

export async function filterContentAction(input: FilterAIContentInput) {
  try {
    return await filterAIContent(input);
  } catch (error) {
    console.error('Error in filterContentAction:', error);
    throw new Error('Failed to filter content.');
  }
}

export async function generateCardAction(input: GenerateAiCardFromPromptInput) {
  try {
    // Here you would add logic to check for premium status or deduct credits
    // For now, we'll allow generation.
    return await generateAiCardFromPrompt(input);
  } catch (error) {
    console.error('Error in generateCardAction:', error);
    // Propagate a more specific error message if available
    const message = error instanceof Error ? error.message : 'Failed to generate the card. Please try again.';
    throw new Error(message);
  }
}

export async function generateMessagesAction(input: GenerateCardMessageInput) {
  try {
    return await generateCardMessage(input);
  } catch (error) {
    console.error('Error in generateMessagesAction:', error);
    throw new Error('Failed to generate messages.');
  }
}

export async function generateRefinedPromptAction(input: GenerateRefinedPromptInput) {
    try {
        return await generateRefinedPrompt(input);
    } catch (error) {
        console.error('Error in generateRefinedPromptAction:', error);
        throw new Error('Failed to generate refined prompt.');
    }
}

export async function generatePromptFromImageAction(input: GeneratePromptFromImageInput) {
    try {
        return await generatePromptFromImage(input);
    } catch (error) {
        console.error('Error in generatePromptFromImageAction:', error);
        throw new Error('Failed to generate a prompt from the image.');
    }
}

export async function generatePostcardImageAction(input: {location: string, style: 'photorealistic' | 'watercolor'}) {
    try {
        const stylePrompt = input.style === 'watercolor'
            ? 'a beautiful watercolor painting of'
            : 'a stunning, high-resolution, photorealistic photograph of';

        const personalizedPrompt = `${stylePrompt} ${input.location}, travel postcard`;
        
        return await generateAiCardFromPrompt({
            masterPrompt: 'A travel postcard.',
            personalizedPrompt: personalizedPrompt,
            aspectRatio: '16:9' // Landscape for postcards
        });
    } catch (error) {
        console.error('Error in generatePostcardImageAction:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate the postcard image.';
        throw new Error(message);
    }
}


export async function generateMemePromptAction(input: GenerateMemePromptInput) {
    try {
        return await generateMemePrompt(input);
    } catch (error) {
        console.error('Error in generateMemePromptAction:', error);
        throw new Error('Failed to generate the meme prompt.');
    }
}

export async function generateVideoFromImageAction(input: GenerateVideoFromImageInput) {
  try {
    // In a real app, you would add premium checks here.
    return await generateVideoFromImage(input);
  } catch (error) {
    console.error('Error in generateVideoFromImageAction:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate the video.';
    throw new Error(message);
  }
}


export async function generateAnimatedSceneAction(input: { scenePrompt: string; animationPrompt: string; staticImageUrl: string; }) {
  try {
    // Step 2: Use the generated image to create the animation
    const videoResult = await generateVideoFromImage({
      imageUrl: input.staticImageUrl,
      prompt: input.animationPrompt,
    });
    
    if (!videoResult || !videoResult.videoUrl) {
      throw new Error('Failed to generate the animation from the scene.');
    }

    // Step 3: Return both URLs
    return {
      staticImageUrl: input.staticImageUrl,
      animatedVideoUrl: videoResult.videoUrl,
    };

  } catch (error) {
    console.error('Error in generateAnimatedSceneAction:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during the animation process.';
    throw new Error(message);
  }
}
