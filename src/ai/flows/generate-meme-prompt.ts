
'use server';

/**
 * @fileOverview A flow to generate a high-quality image prompt from a combination of meme components.
 *
 * - generateMemePrompt - A function that handles the prompt generation.
 * - GenerateMemePromptInput - The input type for the function.
 * - GenerateMemePromptOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateMemePromptInputSchema = z.object({
  protagonist: z.string().describe('The main character of the meme.'),
  situation: z.string().describe('The situation or role the protagonist is in.'),
  problem: z.string().describe('The problem or conflict they are facing.'),
  solution: z.string().describe('The unconventional solution they choose.'),
});
export type GenerateMemePromptInput = z.infer<typeof GenerateMemePromptInputSchema>;

export const GenerateMemePromptOutputSchema = z.object({
  memePrompt: z.string().describe('The detailed, high-quality prompt suitable for an image generation model.'),
});
export type GenerateMemePromptOutput = z.infer<typeof GenerateMemePromptOutputSchema>;

export async function generateMemePrompt(
  input: GenerateMemePromptInput
): Promise<GenerateMemePromptOutput> {
  return generateMemePromptFlow(input);
}

const memePromptGenerator = ai.definePrompt({
  name: 'generateMemePrompt',
  input: { schema: GenerateMemePromptInputSchema },
  output: { schema: GenerateMemePromptOutputSchema },
  prompt: `You are a viral meme generation expert and a master AI prompt engineer. Your task is to take four conceptual components and weave them into a single, cohesive, detailed, and hilarious prompt for a text-to-image AI.

The final prompt should be a single descriptive paragraph. It needs to create a funny, visually interesting, and shareable image. Emphasize visual details, character expression, the environment, and the overall mood. Add keywords like "cinematic," "hyper-detailed," "digital art," and "trending on ArtStation" to ensure a high-quality result.

Here are the components for today's meme:
1.  **Protagonist:** {{{protagonist}}}
2.  **Situation:** {{{situation}}}
3.  **The Problem:** {{{problem}}}
4.  **The Reaction/Solution:** {{{solution}}}

Now, combine these into one fantastic prompt in the 'memePrompt' field.
Example: If the inputs are "A Caffeinated Squirrel," "...stuck in traffic," "The Wi-Fi just went out," and "...so they declare their villain origin story has begun," a great prompt would be:
"A cinematic, hyper-detailed portrait of an extremely caffeinated squirrel stuck in a traffic jam in a tiny, toy-sized car. The squirrel has a look of pure, unadulterated rage on its face as it stares at a buffering symbol on its tiny phone, because the Wi-Fi has gone out. It grips the miniature steering wheel with white knuckles, its villain origin story clearly beginning. Dramatic, humorous, digital art, trending on ArtStation."
`,
});

const generateMemePromptFlow = ai.defineFlow(
  {
    name: 'generateMemePromptFlow',
    inputSchema: GenerateMemePromptInputSchema,
    outputSchema: GenerateMemePromptOutputSchema,
  },
  async (input) => {
    const { output } = await memePromptGenerator(input);
    return output!;
  }
);
