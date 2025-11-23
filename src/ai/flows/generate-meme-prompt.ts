
'use server';

/**
 * @fileOverview A flow to generate a high-quality image prompt from a combination of meme components and style choices.
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
  characterStyle: z.string().describe("Keywords defining the character's visual style."),
  sceneStyle: z.string().describe("Keywords defining the scene's overall style and atmosphere."),
  outputFormat: z.string().describe("Keywords defining the final output format (e.g., 'meme format', 'tarot card')."),
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
  prompt: `You are a viral meme generation expert and a master AI prompt engineer. Your task is to take four conceptual components and three style components and weave them into a single, cohesive, detailed, and hilarious prompt for a text-to-image AI.

The final prompt should be a single descriptive paragraph. It needs to create a funny, visually interesting, and shareable image. Emphasize visual details, character expression, the environment, and the overall mood.

Combine the 'output format', the 'scene style', and the 'character style' keywords with the narrative components to create one fantastic prompt.

Here are the components for today's meme:
1.  **Narrative - Protagonist:** {{{protagonist}}}
2.  **Narrative - Situation:** {{{situation}}}
3.  **Narrative - The Problem:** {{{problem}}}
4.  **Narrative - The Reaction/Solution:** {{{solution}}}

5.  **Style - Character:** {{{characterStyle}}}
6.  **Style - Scene:** {{{sceneStyle}}}
7.  **Style - Output Format:** {{{outputFormat}}}

Now, combine these into one fantastic prompt in the 'memePrompt' field.
Example:
- Narrative: "A Caffeinated Squirrel," "...stuck in traffic," "The Wi-Fi just went out," and "...so they declare their villain origin story has begun."
- Styles: "3D Animated Character," "Dramatic Black & White," "Tarot Card"
- Resulting Prompt: "A Tarot card design, 'The Glitch', featuring a 3D animated character of a caffeinated squirrel stuck in a tiny car in a traffic jam. The squirrel has a look of pure, unadulterated rage on its face as it stares at a buffering symbol on its tiny phone, because the Wi-Fi has gone out, its villain origin story clearly beginning. The entire scene is a dramatic black and white photograph, film noir style, with a mystical, ornate border."
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

    