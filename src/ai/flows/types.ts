
/**
 * @fileOverview This file contains all the shared Zod schemas and TypeScript types for the Genkit AI flows.
 * By centralizing them here, we can safely import them into client and server components
 * without violating the 'use server' boundary of the flow files themselves.
 */

import { z } from 'zod';

// --- generate-ai-card-from-prompt.ts ---
export const GenerateAiCardFromPromptInputSchema = z.object({
  masterPrompt: z.string().describe('A pre-selected master prompt for the overall theme of the card.'),
  personalizedPrompt: z.string().describe('A personalized prompt for specific details of the card design.'),
  photoDataUri: z.string().optional().describe("An optional photo of a user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This can be a style reference image or a base image for modification."),
  modificationStrength: z.number().optional().describe('A value from 0 to 1 indicating the desired strength of image modification. 0.1-0.4 for minor changes, 0.6-0.9 for major transformations.'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16']).optional().describe('The desired aspect ratio for the generated image.'),
  layoutLock: z.boolean().optional().describe('If true, lock the composition of the provided image and apply the prompt as a new theme.')
});
export type GenerateAiCardFromPromptInput = z.infer<typeof GenerateAiCardFromPromptInputSchema>;

export const GenerateAiCardFromPromptOutputSchema = z.object({
  cardDataUri: z.string().describe('The generated card as a data URI (e.g., image/png;base64,...).'),
});
export type GenerateAiCardFromPromptOutput = z.infer<typeof GenerateAiCardFromPromptOutputSchema>;


// --- filter-ai-content-for-inappropriate-content.ts ---
export const FilterAIContentInputSchema = z.object({
  content: z
    .string()
    .describe('The AI-generated content to be checked for safety.'),
});
export type FilterAIContentInput = z.infer<typeof FilterAIContentInputSchema>;

export const FilterAIContentOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe(
      'Whether the content is safe and does not violate any safety guidelines.'
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason why the content was considered unsafe.'),
});
export type FilterAIContentOutput = z.infer<typeof FilterAIContentOutputSchema>;


// --- generate-card-message.ts ---
export const GenerateCardMessageInputSchema = z.object({
  prompt: z.string().describe('The prompt to guide the message generation. This can be a master prompt or a custom user prompt.'),
  occasion: z.string().describe('The occasion for the card (e.g., "birthday", "wedding") to provide context.'),
});
export type GenerateCardMessageInput = z.infer<typeof GenerateCardMessageInputSchema>;

export const GenerateCardMessageOutputSchema = z.object({
  messages: z.array(z.string()).describe('An array of 3-5 generated message suggestions.'),
});
export type GenerateCardMessageOutput = z.infer<typeof GenerateCardMessageOutputSchema>;


// --- generate-meme-prompt.ts ---
export const GenerateMemePromptInputSchema = z.object({
  protagonist: z.string().describe('The main character of the meme.'),
  situation: z.string().describe('The situation or role the protagonist is in.'),
  problem: z.string().describe('The problem or conflict they are facing.'),
  solution: z.string().describe('The unconventional solution they choose.'),
  characterStyle: z.string().describe("Keywords defining the character's visual style."),
  sceneStyle: z.string().describe("Keywords defining the scene's overall style and atmosphere."),
  outputFormat: z.string().describe("Keywords defining the final output format (e.g., 'meme format', 'tarot card')."),
  // Advanced format options
  tarotCard: z.string().optional().describe('The selected Major Arcana card (e.g., "XVI - The Tower").'),
  tarotTransparentBg: z.boolean().optional().describe('If the Tarot card should have a transparent background.'),
  playingCardSuit: z.string().optional().describe('The selected suit symbol (e.g., "♥").'),
  playingCardRank: z.string().optional().describe('The selected rank (e.g., "Q", "10").'),
  playingCardRegalBg: z.boolean().optional().describe('If the playing card should have a regal, symmetrical background.'),
});
export type GenerateMemePromptInput = z.infer<typeof GenerateMemePromptInputSchema>;

export const GenerateMemePromptOutputSchema = z.object({
  memePrompt: z.string().describe('The detailed, high-quality prompt suitable for an image generation model.'),
});
export type GenerateMemePromptOutput = z.infer<typeof GenerateMemePromptOutputSchema>;


// --- generate-prompt-from-image.ts ---
export const GeneratePromptFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePromptFromImageInput = z.infer<typeof GeneratePromptFromImageInputSchema>;

export const GeneratePromptFromImageOutputSchema = z.object({
  generatedPrompt: z.string().describe('The rich, descriptive text prompt generated from the image.'),
});
export type GeneratePromptFromImageOutput = z.infer<typeof GeneratePromptFromImageOutputSchema>;


// --- generate-refined-prompt.ts ---
export const GenerateRefinedPromptInputSchema = z.object({
  basePrompt: z.string().describe('The user\'s initial, basic description of what they want to create.'),
  artisticMedium: z.string().optional().describe('e.g., "watercolor painting", "oil painting", "charcoal sketch", "vintage postcard".'),
  colorPalette: z.string().optional().describe('e.g., "a soft pastel color palette", "vibrant and bold colors", "warm and earthy palette".'),
  composition: z.string().optional().describe('e.g., "close-up portrait", "cinematic wide shot", "symmetrical composition".'),
  lighting: z.string().optional().describe('e.g., "soft diffused lighting", "dramatic, high-contrast lighting", "golden hour glow".'),
  texture: z.string().optional().describe('e.g., "textured paper", "embossed details", "gold foil accents".'),
});
export type GenerateRefinedPromptInput = z.infer<typeof GenerateRefinedPromptInputSchema>;

export const GenerateRefinedPromptOutputSchema = z.object({
  refinedPrompt: z.string().describe('The detailed, high-quality prompt suitable for an image generation model.'),
});
export type GenerateRefinedPromptOutput = z.infer<typeof GenerateRefinedPromptOutputSchema>;


// --- generate-video-from-image.ts ---
export const GenerateVideoFromImageInputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The static image to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('A text prompt describing the desired animation (e.g., "make the stars twinkle", "add falling confetti").'),
});
export type GenerateVideoFromImageInput = z.infer<typeof GenerateVideoFromImageInputSchema>;

export const GenerateVideoFromImageOutputSchema = z.object({
  videoUrl: z.string().describe('The data URI of the generated video.'),
});
export type GenerateVideoFromImageOutput = z.infer<typeof GenerateVideoFromImageOutputSchema>;


// --- summarize-and-improve-user-prompt.ts ---
export const SummarizeAndImproveUserPromptInputSchema = z.object({
  userPrompt: z
    .string()
    .describe('The user-provided prompt for generating the AI card.'),
  masterPrompt: z
    .string()
    .describe('The master prompt providing the overall theme for the AI card.'),
});
export type SummarizeAndImproveUserPromptInput = z.infer<
  typeof SummarizeAndImproveUserPromptInputSchema
>;

export const SummarizeAndImproveUserPromptOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the user prompt, including strengths and areas for improvement.'
    ),
  improvedPrompt: z
    .string()
    .describe('A refined version of the user prompt for better AI generation results.'),
  isGoodPrompt: z.boolean().describe('Whether the original user prompt is high quality.'),
});
export type SummarizeAndImproveUserPromptOutput = z.infer<
  typeof SummarizeAndImproveUserPromptOutputSchema
>;
