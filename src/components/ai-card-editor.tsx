
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  analyzePromptAction,
  filterContentAction,
  generateCardAction,
  generateMessagesAction,
  generateRefinedPromptAction,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2, Lightbulb, Download, Share2, Printer, MessageSquareQuote, Settings, ChevronDown, XCircle, AspectRatio } from 'lucide-react';
import type { MasterPrompt } from '@/lib/data';
import { masterPrompts as allMasterPrompts } from '@/lib/data';
import type { SummarizeAndImproveUserPromptOutput } from '@/ai/flows/summarize-and-improve-user-prompt';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { GenerateRefinedPromptOutput } from '@/ai/flows/generate-refined-prompt';
import { Badge } from './ui/badge';


const formSchema = z.object({
  personalizedPrompt: z.string().min(10, {
    message: 'Please describe your card in at least 10 characters.',
  }),
});

type EditorState = 'idle' | 'analyzing' | 'needs_improvement' | 'generating' | 'done' | 'error';
type MessageState = 'idle' | 'generating' | 'done' | 'error';
type RefinedPromptState = 'idle' | 'generating' | 'done' | 'error';
type AspectRatioType = '9:16' | '16:9' | '1:1';

type CompositionState = {
  framing?: string;
  balance?: string;
  pattern?: string;
  cinematic?: string;
};

type LightingState = {
  natural?: string;
  atmospheric?: string;
  cinematic?: string;
  fantastical?: string;
};

type ArtisticMediumState = {
  painting?: string;
  drawing?: string;
  printmaking?: string;
  craft?: string;
  digital?: string;
};

type ColorPaletteState = {
  vibe?: string;
  thematic?: string;
  artistic?: string;
  harmonies?: string;
};


const refinementOptions = {
  artisticMedium: [
    {
        key: 'painting',
        category: 'Painting Styles',
        description: 'For classic and expressive painted looks.',
        options: [
            { id: 'am-1', label: 'Lush Oil Painting', description: 'Rich, textured, and vibrant. This style mimics thick oil paints on canvas, showing visible brushstrokes and deep colors.', value: 'lush oil painting, thick impasto, visible brushstrokes, textured canvas, style of van gogh' },
            { id: 'am-2', label: 'Delicate Watercolor', description: 'Soft, translucent, and often dreamy. This style features soft, bleeding edges and a light, airy feel, as if painted on wet paper.', value: 'delicate watercolor painting, soft bleeding edges, wet-on-wet technique, translucent washes, on cotton paper' },
            { id: 'am-3', label: 'Flat Gouache Illustration', description: "Opaque, matte, and vibrant. Popular in children's books and modern illustration, this style uses flat, bold layers of color without shine.", value: "flat gouache illustration, opaque paint, matte finish, bold shapes, children's book style" },
            { id: 'am-4', label: 'Abstract Acrylic Pour', description: 'A modern, chaotic, and beautiful style that mimics pouring liquid acrylics. Creates mesmerizing swirls, cells, and marbled patterns.', value: 'abstract acrylic pour, fluid art, liquid marbling, vibrant swirls, cellular patterns, resin art' },
            { id: 'am-5', label: 'Impressionist Painting', description: 'Captures the feeling of a moment. This style, inspired by artists like Monet, uses small, visible brushstrokes to create a beautiful sense of light and movement.', value: 'impressionist painting, style of Monet, dappled light, visible brushwork, captures a fleeting moment' },
        ],
    },
    {
        key: 'drawing',
        category: 'Drawing & Sketching',
        description: 'For hand-drawn, illustrative, and monochrome styles.',
        options: [
            { id: 'am-6', label: 'Dramatic Charcoal Sketch', description: 'A high-contrast, expressive style with deep blacks and soft, smudged grays. Perfect for dramatic portraits and moody scenes.', value: 'dramatic charcoal sketch, on textured paper, smudged, high contrast, expressive, gestural' },
            { id: 'am-7', label: 'Detailed Pen & Ink', description: 'A classic, clean, and intricate style using fine lines. Can be used for technical drawings or beautiful, detailed storybook illustrations.', value: 'detailed pen and ink illustration, cross-hatching, stippling, fine lines, black and white, technical drawing' },
            { id: 'am-8', label: 'Soft Colored Pencil', description: 'A gentle, textured style with a soft, waxy finish. The subtle layering of colors creates a warm and often nostalgic feeling.', value: 'soft colored pencil drawing, gentle blending, layered colors, visible texture, on toned paper' },
        ],
    },
    {
        key: 'printmaking',
        category: 'Printmaking & Graphic Styles',
        description: 'For unique, high-contrast, and stylized looks.',
        options: [
            { id: 'am-9', label: 'Japanese Woodcut (Ukiyo-e)', description: 'The beautiful and iconic style of Japanese art. Features bold outlines, flat planes of color, and elegant compositions.', value: 'Japanese woodcut print, ukiyo-e style, style of Hokusai, bold outlines, flat colors, elegant' },
            { id: 'am-10', label: 'Modern Linocut Print', description: 'A bold, graphic style with a handmade feel, as if carved from a linoleum block. Creates a high-impact, slightly rustic look.', value: 'modern linocut print, graphic, bold, high contrast, carved texture, handmade aesthetic' },
            { id: 'am-11', label: 'Risograph Print', description: 'A trendy, retro style that mimics a specific type of printer. Features a grainy texture, limited vibrant colors, and subtle misalignments.', value: 'Risograph print, grainy texture, limited color palette, halftone, slight misalignment, vibrant ink' },
        ],
    },
    {
        key: 'craft',
        category: 'Craft & Mixed Media',
        description: 'For truly unique, tactile, and surprising results that go beyond pen and paper.',
        options: [
            { id: 'am-12', label: 'Cut Paper Collage', description: "A playful and artistic style that looks like it's made from layers of cut-out colored paper, inspired by artists like Matisse.", value: "cut paper collage, style of Matisse, layered paper, bold shapes, papercraft, handmade" },
            { id: 'am-13', label: 'Detailed Embroidery', description: 'Creates the beautiful, textured look of a design stitched with thread onto fabric. Evokes a cozy, handcrafted, and personal feeling.', value: 'detailed embroidery, stitched, thread texture, on fabric canvas, hoop art, textile art' },
            { id: 'am-14', label: 'Intricate Paper Quilling', description: 'A stunningly detailed art form that uses rolled and shaped strips of paper to create a 3D image. Unique, elegant, and intricate.', value: 'intricate paper quilling art, rolled paper strips, 3D papercraft, filigree, delicate' },
            { id: 'am-15', label: 'Vintage Postcard', description: 'The nostalgic look of an early 20th-century postcard, with faded colors, a slightly aged paper texture, and classic typography.', value: 'vintage postcard, circa 1920, faded colors, aged paper texture, retro, nostalgic' },
        ],
    },
    {
        key: 'digital',
        category: 'Digital & Modern Art',
        description: 'For clean, contemporary, and digitally native styles.',
        options: [
            { id: 'am-16', label: 'Clean Vector Illustration', description: 'A sharp, clean, and modern graphic style with smooth lines and flat colors. Often used in corporate branding and minimalist designs.', value: 'flat vector illustration, clean lines, minimalist graphic, corporate art style, simple, no gradients' },
            { id: 'am-17', label: 'Cute 3D Render', description: 'The soft, friendly, and dimensional look of a 3D animated movie. Perfect for creating cute characters and whimsical scenes.', value: 'cute 3D render, Pixar style, Disney style, soft textures, cinematic lighting, rendered in Blender' },
        ]
    }
  ],
  colorPalette: [
    {
        key: 'vibe',
        category: 'Vibe & Mood',
        description: 'Palettes defined by the feeling they evoke.',
        options: [
            { id: 'cp-1', label: 'Soft Pastels', description: 'Gentle, dreamy, and light. Perfect for baby showers, spring themes, and soft, whimsical designs.', value: 'soft pastel color palette, light and airy, baby pink, mint green, lavender, soft hues, gentle colors' },
            { id: 'cp-2', label: 'Vibrant & Bold', description: 'Energetic, eye-catching, and full of life. Creates a modern, joyful, and high-impact look.', value: 'vibrant and bold color palette, saturated colors, high contrast, pop art colors, electric blue, fuchsia, bright yellow' },
            { id: 'cp-3', label: 'Warm & Earthy', description: 'Cozy, natural, and inviting. Uses colors from nature like terracotta, olive green, and sand. Perfect for a rustic or comforting feel.', value: 'warm and earthy color palette, terracotta, olive green, mustard yellow, burnt sienna, natural tones, rustic' },
            { id: 'cp-4', label: 'Cool & Serene', description: 'Calm, tranquil, and refreshing. Dominated by blues, greens, and cool grays, evoking a sense of peace and clarity.', value: 'cool color palette, serene, tranquil, shades of blue and green, seafoam, cool gray, calming' },
            { id: 'cp-5', label: 'Dark & Moody', description: 'Dramatic, mysterious, and sophisticated. Uses deep, rich colors like charcoal, navy, and burgundy with occasional highlights.', value: 'dark and moody color palette, deep jewel tones, charcoal gray, navy blue, burgundy, high contrast, dramatic' },
            { id: 'cp-6', label: 'Rich Jewel Tones', description: 'Luxurious, opulent, and elegant. Features deep, saturated colors like emerald green, sapphire blue, ruby red, and amethyst purple.', value: 'rich jewel tone palette, emerald green, sapphire blue, ruby red, amethyst, opulent, luxurious, deep saturated colors' },
        ]
    },
    {
        key: 'thematic',
        category: 'Thematic & Seasonal',
        description: 'Palettes associated with specific themes, seasons, or holidays.',
        options: [
            { id: 'cp-7', label: 'Autumnal Warmth', description: 'The cozy and nostalgic colors of a crisp autumn day. Think falling leaves, pumpkins, and warm sweaters.', value: 'autumnal color palette, warm oranges, deep reds, mustard yellows, forest greens, cozy, harvest colors' },
            { id: 'cp-8', label: 'Winter Frost', description: 'The crisp, cool, and magical palette of a winter landscape. Dominated by icy blues, silver, and stark whites.', value: 'winter color palette, icy blues, silver, crisp white, cool tones, frosty, monochromatic blue' },
            { id: 'cp-9', label: 'Coastal & Nautical', description: 'Breezy, clean, and relaxing. The classic combination of sandy beige, crisp white, and various shades of navy and sea blue.', value: 'nautical color palette, navy blue, crisp white, sandy beige, seaside colors, coastal' },
            { id: 'cp-10', label: 'Summer Sunshine', description: 'Bright, vibrant, and fun. The energetic colors of a tropical beach or a sunny day, with bright yellows, ocean blues, and hot pinks.', value: 'summer color palette, bright yellow, turquoise, hot pink, tropical colors, vibrant, sun-drenched' },
        ]
    },
    {
        key: 'artistic',
        category: 'Artistic & Cinematic',
        description: 'Palettes inspired by specific art movements or film styles.',
        options: [
            { id: 'cp-11', label: 'Retro 70s Vibe', description: 'A groovy and nostalgic palette with avocado green, harvest gold, and burnt orange. Fun, funky, and full of personality.', value: 'retro 1970s color palette, avocado green, harvest gold, burnt orange, groovy, vintage, nostalgic' },
            { id: 'cp-12', label: 'Art Deco Glamour', description: 'The sophisticated and luxurious palette of the 1920s. Features black, cream, and striking metallic gold or silver accents.', value: 'Art Deco color palette, black and gold, geometric, luxurious, glamorous, metallic accents, style of the 1920s' },
            { id: 'cp-13', label: 'Cinematic Teal & Orange', description: 'A modern, high-impact movie look. This popular film color grade creates a dramatic contrast between cool blues/teals and warm skin tones/oranges.', value: 'cinematic teal and orange color palette, film look, high contrast, movie color grading' },
            { id: 'cp-14', label: 'Neon Noir', description: 'The electric, futuristic colors of a cyberpunk city at night. Dominated by glowing neons (pinks, blues, purples) against a dark, moody background.', value: 'neon noir color palette, cyberpunk, glowing neon, electric pink, cyan, against a dark background, Blade Runner style' },
        ]
    },
    {
        key: 'harmonies',
        category: 'Color Harmonies',
        description: 'Palettes based on classic color theory for users who want a more technical approach.',
        options: [
            { id: 'cp-15', label: 'Monochromatic', description: 'Sophisticated and cohesive. Uses various shades, tints, and tones of a single color for a clean and elegant effect.', value: 'monochromatic color scheme, shades of blue, single color, tonal, minimalist' },
            { id: 'cp-16', label: 'Analogous', description: 'Calm and pleasing. Uses colors that are next to each other on the color wheel (e.g., yellow, yellow-green, and green) for a serene and unified look.', value: 'analogous color scheme, harmonious, pleasing, colors next to each other on the color wheel' },
            { id: 'cp-17', label: 'Complementary', description: 'Bold and high-impact. Uses colors that are opposite each other on the color wheel (e.g., red and green) to make each other pop.', value: 'complementary color scheme, high contrast, vibrant, colors opposite on the color wheel' },
            { id: 'cp-18', label: 'Faded & Desaturated', description: 'A soft, muted, and often vintage look. Colors are less intense, creating a gentle, understated, and sometimes melancholic mood.', value: 'faded color palette, desaturated colors, muted tones, vintage film look, low saturation' },
        ]
    }
  ],
  composition: [
    {
      key: 'framing',
      category: 'Framing & Shot Type',
      description: 'Controls how close or far the "camera" is and its general perspective.',
      options: [
        { id: 'co-1', label: 'Extreme Close-Up', description: 'Focuses intensely on a single, beautiful detail of your subject, like a flower petal or an eye. Perfect for showing texture and intricate detail.', value: 'extreme close-up, macro shot, macro photography, detailed, intricate textures, super-resolution' },
        { id: 'co-2', label: 'Centered Portrait', description: 'Places your main subject front and center. A classic, bold, and direct composition that commands attention. Ideal for single subjects.', value: 'centered composition, symmetrical portrait, subject in the middle, headshot, direct gaze, centered-shot' },
        { id: 'co-3', label: 'Wide Landscape', description: 'Shows the big picture. Great for epic scenery, establishing a sense of place, and making your subject part of a larger environment.', value: 'wide shot, wide-angle lens, landscape view, establishing shot, panoramic, cinematic wide angle' },
        { id: 'co-4', label: 'Top-Down View / Flat Lay', description: 'Looks straight down at a beautifully arranged scene on a surface. The absolute best choice for card designs, food, and organized objects.', value: 'flat lay composition, top-down view, bird\'s-eye view, neatly arranged, knolling photography' },
        { id: 'co-5', label: 'Low Angle Shot', description: 'Looks up at your subject from below. This makes the subject feel powerful, heroic, and larger than life.', value: 'low angle shot, worm\'s-eye view, heroic angle, dramatic, powerful, looming' },
      ],
    },
    {
      key: 'balance',
      category: 'Artistic Balance & Placement',
      description: 'Deals with classic art and design principles for arranging elements.',
      options: [
        { id: 'co-6', label: 'Rule of Thirds', description: 'A timeless classic. Places your subject slightly off-center for a natural, balanced, and visually pleasing look.', value: 'composition following the rule of thirds, off-center subject, asymmetrical balance, visually pleasing' },
        { id: 'co-7', label: 'Perfect Symmetry', description: 'Creates a formal, stable, and perfectly balanced image by mirroring the left and right sides. Great for architecture, patterns, and reflections.', value: 'perfectly symmetrical composition, mirrored, balanced, formal, centered, reflection' },
        { id: 'co-8', label: 'Minimalist & Clean', description: 'Less is more. Features a single subject with lots of clean, empty space around it for a modern, elegant, and sophisticated feel.', value: 'minimalist composition, lots of negative space, clean, simple, uncluttered, spacious' },
        { id: 'co-9', label: 'Frame Within a Frame', description: 'Uses elements in the scene (like a window, an archway, or tree branches) to naturally frame your main subject, adding depth and focus.', value: 'frame within a frame, looking through a window, natural framing, adds depth, layered composition' },
      ],
    },
    {
      key: 'pattern',
      category: 'Pattern & Density',
      description: 'Perfect for card backgrounds and decorative elements.',
      options: [
        { id: 'co-10', label: 'Dense Pattern', description: 'Fills the entire space with a rich, repeating pattern of your subject. Lush, detailed, and visually engaging, like wallpaper or wrapping paper.', value: 'dense pattern, repeating pattern, fills the frame, wallpaper pattern, intricate, seamless pattern' },
        { id: 'co-11', label: 'Scattered & Delicate', description: 'Sprinkles your subjects lightly and randomly across the canvas. This creates a playful, delicate, and airy feel, like falling confetti or petals.', value: 'delicately scattered, sparse arrangement, floating, random pattern, airy' },
        { id: 'co-12', label: 'Decorative Border', description: 'Arranges elements like flowers, vines, or stars to create a beautiful border around the edges, leaving the center open for your message.', value: 'decorative border, floral frame, framing the composition, wreath design, garland, edge details' },
      ],
    },
    {
        key: 'cinematic',
        category: 'Dynamic & Cinematic',
        description: 'These advanced options create a sense of movement and story.',
        options: [
            { id: 'co-13', label: 'Leading Lines', description: 'Uses lines within the image (a road, a river, a fence) to create a path that guides the viewer\'s eye directly to your main subject.', value: 'leading lines, strong diagonal lines, guides the eye, vanishing point, dynamic composition, one-point perspective' },
            { id: 'co-14', label: 'Dynamic Angle (Dutch Angle)', description: 'Tilts the "camera" for a dramatic, unsettling, or energetic feeling. Perfect for action, excitement, and high-impact scenes.', value: 'dutch angle, tilted frame, canted angle, dynamic, off-kilter, action shot' },
            { id: 'co-15', label: 'Golden Spiral', description: 'An advanced composition based on a natural spiral (the golden ratio). Creates a perfectly balanced and organic flow that is naturally beautiful to the human eye.', value: 'golden ratio, Fibonacci spiral, perfect composition, organic flow, dynamic symmetry, divine proportion' },
        ]
    }
  ],
  lighting: [
    {
      key: 'natural',
      category: 'Natural Light (Time of Day)',
      description: 'For capturing the feeling of a specific time of day.',
      options: [
        { id: 'li-1', label: 'Golden Hour Glow', description: 'The warm, soft, and nostalgic light just before sunset or after sunrise. Perfect for beautiful portraits and dreamy landscapes.', value: 'golden hour, magic hour, warm soft light, long shadows, cinematic, sunset lighting' },
        { id: 'li-2', label: 'Bright Midday Sun', description: 'The strong, direct light of a clear day. Creates vibrant colors and sharp, defined shadows. Great for energetic and lively scenes.', value: 'direct midday sun, harsh shadows, bright sunlight, high contrast, vibrant' },
        { id: 'li-3', label: 'Blue Hour Serenity', description: 'The cool, calm, and moody light in the twilight sky just after the sun has set. Creates a serene and often magical atmosphere.', value: 'blue hour, twilight, deep blue sky, cool tones, ambient light, tranquil' },
        { id: 'li-4', label: 'Crisp Morning Light', description: 'The clean, clear light of the early morning. It\'s bright but not as harsh as midday, giving a feeling of freshness and optimism.', value: 'soft morning light, crisp, clean, gentle shadows, bright and airy, window light' },
      ],
    },
    {
      key: 'atmospheric',
      category: 'Atmospheric & Weather',
      description: 'For when the weather itself is the source of the mood.',
      options: [
        { id: 'li-5', label: 'Soft & Diffused', description: 'The even, gentle light of an overcast day. It minimizes shadows and is very flattering for subjects. Perfect for a calm, soft look.', value: 'soft diffused light, overcast sky, minimal shadows, even lighting, cloudy day' },
        { id: 'li-6', label: 'Dramatic High Contrast', description: 'Strong light and deep, dark shadows. This creates a bold, intense, and focused look, often seen in film noir and fine art.', value: 'high contrast, dramatic lighting, chiaroscuro, hard shadows, film noir style, moody' },
        { id: 'li-7', label: 'Dappled Sunlight', description: 'The playful light that filters down through tree leaves, creating a pattern of light and shadow. Evokes a feeling of nature and a peaceful afternoon.', value: 'dappled sunlight, light filtering through leaves, speckled light, forest light' },
        { id: 'li-8', label: 'Misty & Ethereal', description: 'Light that passes through fog or mist, creating visible beams and a soft, mysterious, and dreamy atmosphere.', value: 'misty, foggy atmosphere, volumetric light, light rays, god rays, ethereal, moody' },
      ],
    },
    {
      key: 'cinematic',
      category: 'Cinematic & Artistic',
      description: 'For stylized looks that tell a story.',
      options: [
        { id: 'li-9', label: 'Rim Lighting (Backlit)', description: 'The subject is lit from behind, creating a bright, glowing outline or "rim" of light. It\'s dramatic and helps separate the subject from the background.', value: 'rim lighting, backlit, glowing edges, silhouetted, dramatic silhouette' },
        { id: 'li-10', label: 'Low-Key Lighting', description: 'The scene is mostly dark, with only a few key areas selectively illuminated. Creates a sense of mystery, intimacy, or drama.', value: 'low-key lighting, dark and moody, deep shadows, selective illumination, mysterious' },
        { id: 'li-11', label: 'Cinematic Color Grade', description: 'A professional, movie-like look with stylized colors (like the popular teal and orange look). This option focuses on the color of the light itself.', value: 'cinematic lighting, cinematic color grade, volumetric lighting, moody film look' },
        { id: 'li-12', label: 'Professional Studio Light', description: 'The clean, perfect, and controlled lighting of a professional photo studio. Ideal for product shots, fashion, and flawless portraits.', value: 'professional studio lighting, three-point lighting, clean, even light, softbox, flawless' },
      ],
    },
    {
      key: 'fantastical',
      category: 'Artificial & Fantastical',
      description: 'For unique and magical effects that only AI can create perfectly every time.',
      options: [
        { id: 'li-13', label: 'Cozy Candlelight', description: 'The warm, flickering, and intimate glow of candlelight. Perfect for romantic, historical, or cozy holiday scenes.', value: 'lit by candlelight, warm flickering light, intimate, cozy glow, firelight' },
        { id: 'li-14', label: 'Neon & Cyberpunk', description: 'The vibrant, electric glow of neon signs in a dark, often rainy, setting. Creates a futuristic, edgy, and high-tech feel.', value: 'neon lighting, cyberpunk, vibrant glowing lights, reflections on wet streets, futuristic' },
        { id: 'li-15', label: 'Bioluminescent Glow', description: 'A magical, otherworldly light that seems to come from nature itself—glowing mushrooms, plants, or fantasy creatures.', value: 'bioluminescent, glowing flora, ethereal glow, magical light, fantasy, enchanting' },
        { id: 'li-16', label: 'Iridescent & Pearlescent', description: 'A shimmering, multi-colored light that shifts and changes like a soap bubble or an opal. Creates a dreamy, surreal, and magical effect.', value: 'iridescent light, pearlescent, shimmering, opalescent, holographic sheen, rainbow reflections' },
      ],
    },
  ],
  texture: [
    { id: 'te-1', value: 'textured paper', label: 'Textured Paper' },
    { id: 'te-2', value: 'embossed details', label: 'Embossed' },
    { id: 'te-3', value: 'gold foil accents', label: 'Gold Foil' },
  ],
};


export function AiCardEditor({ masterPrompt, photoDataUri }: { masterPrompt: MasterPrompt, photoDataUri?: string }) {
  const [editorState, setEditorState] = useState<EditorState>('idle');
  const [messageState, setMessageState] = useState<MessageState>('idle');
  const [refinedPromptState, setRefinedPromptState] = useState<RefinedPromptState>('idle');
  
  const [analysis, setAnalysis] = useState<SummarizeAndImproveUserPromptOutput | null>(null);
  const [refinedPrompt, setRefinedPrompt] = useState<GenerateRefinedPromptOutput | null>(null);
  
  const [finalCardUri, setFinalCardUri] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState<string>('');
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for refinement selections
  const [artisticMedium, setArtisticMedium] = useState<ArtisticMediumState>({});
  const [colorPalette, setColorPalette] = useState<ColorPaletteState>({});
  const [composition, setComposition] = useState<CompositionState>({});
  const [lighting, setLighting] = useState<LightingState>({});
  const [texture, setTexture] = useState<string | undefined>();
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');

  // State for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    aspectRatio: true,
    artisticMedium: false,
    colorPalette: false,
    composition: false,
    lighting: false,
    texture: false,
  });

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalizedPrompt: '',
    },
  });

  const relevantMasterPrompts = allMasterPrompts.filter(p => p.occasion === masterPrompt.occasion);
  
  const modifiedMasterPrompt = photoDataUri
    ? `${masterPrompt.prompt} Use the following image as the primary background and inspiration.`
    : masterPrompt.prompt;
    
  const generateCardInput = (promptToUse: string) => {
    let input: any = {
        masterPrompt: modifiedMasterPrompt,
        personalizedPrompt: promptToUse,
        aspectRatio: aspectRatio
    }
    if (photoDataUri) {
        input.photoDataUri = photoDataUri
    }
    return input;
  }

  async function onAnalyze() {
    setEditorState('analyzing');
    setErrorMessage(null);

    try {
      const analysisResult = await analyzePromptAction({
        userPrompt: form.getValues('personalizedPrompt'),
        masterPrompt: modifiedMasterPrompt,
      });

      setAnalysis(analysisResult);

      if (!analysisResult.isGoodPrompt) {
        setEditorState('needs_improvement');
      } else {
        await proceedToGeneration(analysisResult.improvedPrompt);
      }
    } catch (error) {
      handleError(error, 'Could not analyze your prompt.');
    }
  }

  async function onGenerateRefinedPrompt() {
    setRefinedPromptState('generating');
    setErrorMessage(null);

    try {
        const fullArtisticMediumPrompt = Object.values(artisticMedium).filter(Boolean).join(', ');
        const fullCompositionPrompt = Object.values(composition).filter(Boolean).join(', ');
        const fullLightingPrompt = Object.values(lighting).filter(Boolean).join(', ');
        const fullColorPalettePrompt = Object.values(colorPalette).filter(Boolean).join(', ');

        const result = await generateRefinedPromptAction({
            basePrompt: form.getValues('personalizedPrompt'),
            artisticMedium: fullArtisticMediumPrompt,
            colorPalette: fullColorPalettePrompt,
            composition: fullCompositionPrompt,
            lighting: fullLightingPrompt,
            texture
        });
        setRefinedPrompt(result);
        setRefinedPromptState('done');
    } catch (error) {
        handleError(error, 'Could not generate a refined prompt.');
        setRefinedPromptState('error');
    }
  }


  async function proceedToGeneration(promptToUse: string) {
    setEditorState('generating');
    setErrorMessage(null);

    try {
      const filterResult = await filterContentAction({ content: promptToUse });
      if (!filterResult.isSafe) {
        handleError(new Error(filterResult.reason), 'Your prompt was flagged as inappropriate. Please revise it.');
        setEditorState('idle');
        return;
      }

      const cardResult = await generateCardAction(generateCardInput(promptToUse));

      setFinalCardUri(cardResult.cardDataUri);
      setEditorState('done');
      toast({
        title: 'Success!',
        description: 'Your unique AI card has been generated.',
      });
    } catch (error) {
      handleError(error, 'There was an issue generating your card.');
    }
  }
  
  async function handleGenerateMessages() {
    setMessageState('generating');
    try {
      const result = await generateMessagesAction({
        prompt: form.getValues('personalizedPrompt') || masterPrompt.prompt,
        occasion: masterPrompt.occasion,
      });
      setSuggestedMessages(result.messages);
      setMessageState('done');
    } catch (error) {
       handleError(error, 'Could not generate message suggestions.');
       setMessageState('error');
    }
  }

  function handleError(error: unknown, defaultMessage: string) {
    const message = error instanceof Error ? error.message : defaultMessage;
    setErrorMessage(message);
    setEditorState('error');
    toast({
      variant: 'destructive',
      title: 'An error occurred',
      description: message,
    });
  }

  function handleReset() {
    setEditorState('idle');
    setMessageState('idle');
    setRefinedPromptState('idle');
    setAnalysis(null);
    setRefinedPrompt(null);
    setFinalCardUri(null);
    setSuggestedMessages([]);
    setErrorMessage(null);
    setPersonalMessage('');
    form.reset();
  }

  const handleShare = async () => {
    toast({
        title: "Coming Soon!",
        description: "The ability to share your card is coming soon."
    });
  };

  const isLoading = editorState === 'analyzing' || editorState === 'generating';
  const isRefining = refinedPromptState === 'generating';

  const isAnyRefinementSelected = 
    Object.values(artisticMedium).some(Boolean) || 
    Object.values(colorPalette).some(Boolean) || 
    Object.values(lighting).some(Boolean) || 
    !!texture || 
    Object.values(composition).some(Boolean);

  const canGenerateRefinedPrompt = isLoading || isRefining || (!form.getValues('personalizedPrompt') && !isAnyRefinementSelected);

  if (editorState === 'done' && finalCardUri) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Your Card is Ready!</CardTitle>
          <CardDescription>Download your creation or add a personal message.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full rounded-lg overflow-hidden border relative bg-muted" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
            <Image src={finalCardUri} alt="Generated AI card" fill className="object-contain" />
            {personalMessage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 flex items-end justify-center p-8">
                    <p className="text-white text-center text-xl font-body">{personalMessage}</p>
                </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a href={finalCardUri} download="cardcraft-creation.png">
              <Button className="w-full"><Download className="mr-2 h-4 w-4" /> Download</Button>
            </a>
            <Button variant="secondary" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
            <Button variant="secondary"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
          <div className="w-full space-y-2">
              <Label htmlFor="personal-message">Add a Personal Message (optional)</Label>
              <Textarea
                id="personal-message"
                placeholder="Write your heartfelt message here..."
                rows={3}
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
              />
          </div>

          {messageState !== 'done' && (
             <Button onClick={handleGenerateMessages} disabled={messageState === 'generating'} className="w-full" variant="outline">
              {messageState === 'generating' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquareQuote className="mr-2 h-4 w-4" />
              )}
              Get Message Ideas
            </Button>
          )}

           {messageState === 'done' && suggestedMessages.length > 0 && (
                <div className="space-y-2 w-full">
                    <Label>AI Message Suggestions (click to use)</Label>
                    <Carousel opts={{ align: "start", loop: false }} className="w-full">
                      <CarouselContent>
                        {suggestedMessages.map((msg, index) => (
                          <CarouselItem key={index} className="md:basis-1/2">
                            <div className="p-1">
                               <Card className="bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => {
                                 setPersonalMessage(msg);
                                 toast({ title: 'Message added!' });
                               }}>
                                <CardContent className="p-4 text-sm">
                                  <p>{msg}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                </div>
              )}
          
          <Button variant="outline" className="w-full mt-4" onClick={handleReset}>
            Create Another Card
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const RefinementSection = ({ title, options, value, onValueChange, categoryKey }: { title: string, options: any[], value: any, onValueChange: (value: any) => void, categoryKey: string }) => {
    const isMultiSelect = categoryKey === 'composition' || categoryKey === 'lighting' || categoryKey === 'artisticMedium' || categoryKey === 'colorPalette';
    const isOpen = openSections[categoryKey];
    const onOpenChange = (open: boolean) => setOpenSections(prev => ({ ...prev, [categoryKey]: open }));


    return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
            <span className="font-semibold">{title}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
              {isMultiSelect ? (
                options.map(category => (
                  <div key={category.category} className="mt-4 first:mt-0">
                    <div className='flex items-center gap-2'>
                        <h4 className="font-semibold text-sm mb-1">{category.category}</h4>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                    <RadioGroup 
                      value={value[category.key]} 
                      onValueChange={(selectedValue) => onValueChange({ ...value, [category.key]: selectedValue })}
                      className="grid gap-2"
                    >
                      {category.options.map((option: any) => (
                        <div key={option.id} className="p-2 rounded-md border border-transparent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                            <div className="flex items-start space-x-2">
                                <RadioGroupItem value={option.value} id={option.id} className="mt-1" />
                                <div className="grid gap-1.5">
                                <Label htmlFor={option.id}>{option.label}</Label>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                                </div>
                            </div>
                        </div>
                      ))}
                    </RadioGroup>
                     {value[category.key] && <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => onValueChange({ ...value, [category.key]: undefined })}><XCircle className="mr-1 h-4 w-4" />Clear</Button>}
                  </div>
                ))
              ) : (
                <RadioGroup value={value} onValueChange={onValueChange}>
                {options.map((option:any) => (
                    <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.id} />
                        <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                ))}
                </RadioGroup>
              )}
            {
              !isMultiSelect && value && <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => onValueChange(undefined)}><XCircle className="mr-1 h-4 w-4" />Clear</Button>
            }
        </CollapsibleContent>
    </Collapsible>
    )
  };
  
  const AspectRatioSection = () => {
    const isOpen = openSections.aspectRatio;
    const onOpenChange = (open: boolean) => setOpenSections(prev => ({...prev, aspectRatio: open}));

    return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
            <span className="font-semibold">Aspect Ratio</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
            <RadioGroup value={aspectRatio} onValueChange={(val) => setAspectRatio(val as AspectRatioType)} className="grid gap-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="9:16" id="ar-portrait" />
                    <Label htmlFor="ar-portrait">Portrait (Card)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="16:9" id="ar-landscape" />
                    <Label htmlFor="ar-landscape">Landscape</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1:1" id="ar-square" />
                    <Label htmlFor="ar-square">Square</Label>
                </div>
            </RadioGroup>
        </CollapsibleContent>
    </Collapsible>
    )
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Personalize Your AI Card</CardTitle>
        <CardDescription>You chose the <span className="font-bold text-primary">{masterPrompt.name}</span> style. Now, add your personal touch.</CardDescription>
        {photoDataUri && (
             <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Your Photo:</p>
                <Image src={photoDataUri} alt="User photo for postcard" width={200} height={150} className="rounded-md border" />
             </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="personalizedPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Describe what you want to create</FormLabel>
                   <div className="text-xs p-2 rounded-md bg-muted/80 text-muted-foreground">
                    Try a structured prompt: [Occasion] card, [Subject], in the style of [Artistic Style], with a [Mood] atmosphere, featuring [Key Visuals], in a [Color Palette].
                   </div>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'A watercolor painting of a calico cat wearing a tiny crown, sitting on a pile of books. Soft, dreamy lighting.'"
                      rows={5}
                      {...field}
                      disabled={isLoading || editorState === 'needs_improvement'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {relevantMasterPrompts.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                        Or, start with a high-quality Master Prompt (click to use)
                    </Label>
                    <Carousel opts={{ align: "start", loop: false }} className="w-full">
                      <CarouselContent>
                        {relevantMasterPrompts.map((prompt) => (
                          <CarouselItem key={prompt.id} className="md:basis-1/2">
                            <div className="p-1">
                               <Card className="bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => form.setValue('personalizedPrompt', prompt.prompt)}>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm font-semibold">{prompt.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-xs">
                                  <p className="line-clamp-2">{prompt.prompt}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                </div>
            )}
            
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/> Prompt Refinements</CardTitle>
                    <CardDescription>Select options to generate a more detailed prompt suggestion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <AspectRatioSection />
                    <RefinementSection title="Artistic Medium" options={refinementOptions.artisticMedium} value={artisticMedium} onValueChange={setArtisticMedium} categoryKey="artisticMedium" />
                    <RefinementSection title="Color Palette" options={refinementOptions.colorPalette} value={colorPalette} onValueChange={setColorPalette} categoryKey="colorPalette" />
                    <RefinementSection title="Composition" options={refinementOptions.composition} value={composition} onValueChange={setComposition} categoryKey="composition" />
                    <RefinementSection title="Lighting" options={refinementOptions.lighting} value={lighting} onValueChange={setLighting} categoryKey="lighting" />
                    <RefinementSection title="Texture" options={refinementOptions.texture} value={texture} onValueChange={setTexture} categoryKey="texture" />
                </CardContent>
                <CardFooter>
                     <Button type="button" onClick={onGenerateRefinedPrompt} className="w-full" disabled={canGenerateRefinedPrompt}>
                        {isRefining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Refined Prompt
                    </Button>
                </CardFooter>
            </Card>

            {refinedPromptState === 'done' && refinedPrompt && (
              <Alert variant="default" className="bg-accent/20 border-accent/50">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="font-headline text-accent">Refined Prompt Suggestion</AlertTitle>
                <AlertDescription className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">Suggested Prompt:</p>
                    <blockquote className="border-l-2 pl-4 italic text-sm">{refinedPrompt.refinedPrompt}</blockquote>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => proceedToGeneration(refinedPrompt.refinedPrompt)}>
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                      Use Suggestion & Generate
                    </Button>
                     <Button variant="outline" type="button" onClick={() => form.setValue('personalizedPrompt', refinedPrompt.refinedPrompt)}>
                        Copy to Editor
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {editorState === 'needs_improvement' && analysis && (
              <Alert variant="default" className="bg-accent/20 border-accent/50">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="font-headline text-accent">Instant Prompt Suggestion</AlertTitle>
                <AlertDescription className="space-y-4">
                  <p>{analysis.summary}</p>
                  <div>
                    <p className="font-semibold mb-1">Suggested Prompt:</p>
                    <blockquote className="border-l-2 pl-4 italic text-sm">{analysis.improvedPrompt}</blockquote>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => proceedToGeneration(analysis.improvedPrompt)}>
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                      Use Suggestion & Generate
                    </Button>
                    <Button variant="outline" type="button" onClick={() => setEditorState('idle')}>
                      Let Me Edit
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            )}
            <div className="pt-4 space-y-2">
                <Button type="button" onClick={onAnalyze} className="w-full" variant="secondary" disabled={isLoading || editorState === 'needs_improvement'}>
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                        <><Lightbulb className="mr-2 h-4 w-4" /> Get Instant Suggestion</>
                    )}
                </Button>

                <Button type="button" onClick={() => form.handleSubmit(() => proceedToGeneration(form.getValues('personalizedPrompt')))()} className="w-full" disabled={isLoading || editorState === 'needs_improvement'}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Card (Original Prompt)
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
