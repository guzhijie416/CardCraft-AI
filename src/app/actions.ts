'use server';

import { generateAiCardFromPrompt } from '@/ai/flows/generate-ai-card-from-prompt';
import type { GenerateAiCardFromPromptInput } from '@/ai/flows/generate-ai-card-from-prompt';

import { filterAIContent } from '@/ai/flows/filter-ai-content-for-inappropriate-content';
import type { FilterAIContentInput } from '@/ai/flows/filter-ai-content-for-inappropriate-content';

import { summarizeAndImproveUserPrompt } from '@/ai/flows/summarize-and-improve-user-prompt';
import type { SummarizeAndImproveUserPromptInput } from '@/ai/flows/summarize-and-improve-user-prompt';

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
    throw new Error('Failed to generate the card. Please try again.');
  }
}
