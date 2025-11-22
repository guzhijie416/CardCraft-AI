
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateCardAction,
  generateRefinedPromptAction
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, UploadCloud, Download, Repeat, Sparkles, Settings, ChevronDown, XCircle, Copy, FilePlus, Bot } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { masterPrompts as allMasterPrompts } from '@/lib/data';
import type { GenerateRefinedPromptOutput } from '@/ai/flows/generate-refined-prompt';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

// --- Reusable Types ---
type GenerationState = 'idle' | 'generating' | 'done' | 'error';
type RefinedPromptState = 'idle' | 'generating' | 'done' | 'error';
type AspectRatioType = '9:16' | '16:9' | '1:1';

// --- Reusable State Types for Refinements ---
type CompositionState = { framing?: string; balance?: string; pattern?: string; cinematic?: string; };
type LightingState = { natural?: string; atmospheric?: string; cinematic?: string; fantastical?: string; };
type ArtisticMediumState = { painting?: string; drawing?: string; printmaking?: string; craft?: string; digital?: string; };
type ColorPaletteState = { vibe?: string; thematic?: string; artistic?: string; harmonies?: string; };
type TextureState = { paper?: string; finishes?: string; distressed?: string; fabric?: string; };

// --- Reusable Refinement Options ---
const refinementOptions = {
    artisticMedium: [
        { key: 'painting', category: 'Painting Styles', description: 'For classic and expressive painted looks.', options: [ { id: 'am-1', label: 'Lush Oil Painting', description: 'Rich, textured, and vibrant. This style mimics thick oil paints on canvas, showing visible brushstrokes and deep colors.', value: 'lush oil painting, thick impasto, visible brushstrokes, textured canvas, style of van gogh' }, { id: 'am-2', label: 'Delicate Watercolor', description: 'Soft, translucent, and often dreamy. This style features soft, bleeding edges and a light, airy feel, as if painted on wet paper.', value: 'delicate watercolor painting, soft bleeding edges, wet-on-wet technique, translucent washes, on cotton paper' }, { id: 'am-3', label: 'Flat Gouache Illustration', description: "Opaque, matte, and vibrant. Popular in children's books and modern illustration, this style uses flat, bold layers of color without shine.", value: "flat gouache illustration, opaque paint, matte finish, bold shapes, children's book style" }, { id: 'am-4', label: 'Abstract Acrylic Pour', description: 'A modern, chaotic, and beautiful style that mimics pouring liquid acrylics. Creates mesmerizing swirls, cells, and marbled patterns.', value: 'abstract acrylic pour, fluid art, liquid marbling, vibrant swirls, cellular patterns, resin art' }, { id: 'am-5', label: 'Impressionist Painting', description: 'Captures the feeling of a moment. This style, inspired by artists like Monet, uses small, visible brushstrokes to create a beautiful sense of light and movement.', value: 'impressionist painting, style of Monet, dappled light, visible brushwork, captures a fleeting moment' }, ] },
        { key: 'drawing', category: 'Drawing & Sketching', description: 'For hand-drawn, illustrative, and monochrome styles.', options: [ { id: 'am-6', label: 'Dramatic Charcoal Sketch', description: 'A high-contrast, expressive style with deep blacks and soft, smudged grays. Perfect for dramatic portraits and moody scenes.', value: 'dramatic charcoal sketch, on textured paper, smudged, high contrast, expressive, gestural' }, { id: 'am-7', label: 'Detailed Pen & Ink', description: 'A classic, clean, and intricate style using fine lines. Can be used for technical drawings or beautiful, detailed storybook illustrations.', value: 'detailed pen and ink illustration, cross-hatching, stippling, fine lines, black and white, technical drawing' }, { id: 'am-8', label: 'Soft Colored Pencil', description: 'A gentle, textured style with a soft, waxy finish. The subtle layering of colors creates a warm and often nostalgic feeling.', value: 'soft colored pencil drawing, gentle blending, layered colors, visible texture, on toned paper' }, ] },
        { key: 'printmaking', category: 'Printmaking & Graphic Styles', description: 'For unique, high-contrast, and stylized looks.', options: [ { id: 'am-9', label: 'Japanese Woodcut (Ukiyo-e)', description: 'The beautiful and iconic style of Japanese art. Features bold outlines, flat planes of color, and elegant compositions.', value: 'Japanese woodcut print, ukiyo-e style, style of Hokusai, bold outlines, flat colors, elegant' }, { id: 'am-10', label: 'Modern Linocut Print', description: 'A bold, graphic style with a handmade feel, as if carved from a linoleum block. Creates a high-impact, slightly rustic look.', value: 'modern linocut print, graphic, bold, high contrast, carved texture, handmade aesthetic' }, { id: 'am-11', label: 'Risograph Print', description: 'A trendy, retro style that mimics a specific type of printer. Features a grainy texture, limited vibrant colors, and subtle misalignments.', value: 'Risograph print, grainy texture, limited color palette, halftone, slight misalignment, vibrant ink' }, ] },
        { key: 'craft', category: 'Craft & Mixed Media', description: 'For truly unique, tactile, and surprising results that go beyond pen and paper.', options: [ { id: 'am-12', label: 'Cut Paper Collage', description: "A playful and artistic style that looks like it's made from layers of cut-out colored paper, inspired by artists like Matisse.", value: "cut paper collage, style of Matisse, layered paper, bold shapes, papercraft, handmade" }, { id: 'am-13', label: 'Detailed Embroidery', description: 'Creates the beautiful, textured look of a design stitched with thread onto fabric. Evokes a cozy, handcrafted, and personal feeling.', value: 'detailed embroidery, stitched, thread texture, on fabric canvas, hoop art, textile art' }, { id: 'am-14', label: 'Intricate Paper Quilling', description: 'A stunningly detailed art form that uses rolled and shaped strips of paper to create a 3D image. Unique, elegant, and intricate.', value: 'intricate paper quilling art, rolled paper strips, 3D papercraft, filigree, delicate' }, { id: 'am-15', label: 'Vintage Postcard', description: 'The nostalgic look of an early 20th-century postcard, with faded colors, a slightly aged paper texture, and classic typography.', value: 'vintage postcard, circa 1920, faded colors, aged paper texture, retro, nostalgic' }, ] },
        { key: 'digital', category: 'Digital & Modern Art', description: 'For clean, contemporary, and digitally native styles.', options: [ { id: 'am-16', label: 'Clean Vector Illustration', description: 'A sharp, clean, and modern graphic style with smooth lines and flat colors. Often used in corporate branding and minimalist designs.', value: 'flat vector illustration, clean lines, minimalist graphic, corporate art style, simple, no gradients' }, { id: 'am-17', label: 'Cute 3D Render', description: 'The soft, friendly, and dimensional look of a 3D animated movie. Perfect for creating cute characters and whimsical scenes.', value: 'cute 3D render, Pixar style, Disney style, soft textures, cinematic lighting, rendered in Blender' }, ] }
    ],
    colorPalette: [
        { key: 'vibe', category: 'Vibe & Mood', description: 'Palettes defined by the feeling they evoke.', options: [ { id: 'cp-1', label: 'Soft Pastels', description: 'Gentle, dreamy, and light. Perfect for baby showers, spring themes, and soft, whimsical designs.', value: 'soft pastel color palette, light and airy, baby pink, mint green, lavender, soft hues, gentle colors' }, { id: 'cp-2', label: 'Vibrant & Bold', description: 'Energetic, eye-catching, and full of life. Creates a modern, joyful, and high-impact look.', value: 'vibrant and bold color palette, saturated colors, high contrast, pop art colors, electric blue, fuchsia, bright yellow' }, { id: 'cp-3', label: 'Warm & Earthy', description: 'Cozy, natural, and inviting. Uses colors from nature like terracotta, olive green, and sand. Perfect for a rustic or comforting feel.', value: 'warm and earthy color palette, terracotta, olive green, mustard yellow, burnt sienna, natural tones, rustic' }, { id: 'cp-4', label: 'Cool & Serene', description: 'Calm, tranquil, and refreshing. Dominated by blues, greens, and cool grays, evoking a sense of peace and clarity.', value: 'cool color palette, serene, tranquil, shades of blue and green, seafoam, cool gray, calming' }, { id: 'cp-5', label: 'Dark & Moody', description: 'Dramatic, mysterious, and sophisticated. Uses deep, rich colors like charcoal, navy, and burgundy with occasional highlights.', value: 'dark and moody color palette, deep jewel tones, charcoal gray, navy blue, burgundy, high contrast, dramatic' }, { id: 'cp-6', label: 'Rich Jewel Tones', description: 'Luxurious, opulent, and elegant. Features deep, saturated colors like emerald green, sapphire blue, ruby red, and amethyst purple.', value: 'rich jewel tone palette, emerald green, sapphire blue, ruby red, amethyst, opulent, luxurious, deep saturated colors' }, ] },
        { key: 'thematic', category: 'Thematic & Seasonal', description: 'Palettes associated with specific themes, seasons, or holidays.', options: [ { id: 'cp-7', label: 'Autumnal Warmth', description: 'The cozy and nostalgic colors of a crisp autumn day. Think falling leaves, pumpkins, and warm sweaters.', value: 'autumnal color palette, warm oranges, deep reds, mustard yellows, forest greens, cozy, harvest colors' }, { id: 'cp-8', label: 'Winter Frost', description: 'The crisp, cool, and magical palette of a winter landscape. Dominated by icy blues, silver, and stark whites.', value: 'winter color palette, icy blues, silver, crisp white, cool tones, frosty, monochromatic blue' }, { id: 'cp-9', label: 'Coastal & Nautical', description: 'Breezy, clean, and relaxing. The classic combination of sandy beige, crisp white, and various shades of navy and sea blue.', value: 'nautical color palette, navy blue, crisp white, sandy beige, seaside colors, coastal' }, { id: 'cp-10', label: 'Summer Sunshine', description: 'Bright, vibrant, and fun. The energetic colors of a tropical beach or a sunny day, with bright yellows, ocean blues, and hot pinks.', value: 'summer color palette, bright yellow, turquoise, hot pink, tropical colors, vibrant, sun-drenched' }, ] },
        { key: 'artistic', category: 'Artistic & Cinematic', description: 'Palettes inspired by specific art movements or film styles.', options: [ { id: 'cp-11', label: 'Retro 70s Vibe', description: 'A groovy and nostalgic palette with avocado green, harvest gold, and burnt orange. Fun, funky, and full of personality.', value: 'retro 1970s color palette, avocado green, harvest gold, burnt orange, groovy, vintage, nostalgic' }, { id: 'cp-12', label: 'Art Deco Glamour', description: 'The sophisticated and luxurious palette of the 1920s. Features black, cream, and striking metallic gold or silver accents.', value: 'Art Deco color palette, black and gold, geometric, luxurious, glamorous, metallic accents, style of the 1920s' }, { id: 'cp-13', label: 'Cinematic Teal & Orange', description: 'A modern, high-impact movie look. This popular film color grade creates a dramatic contrast between cool blues/teals and warm skin tones/oranges.', value: 'cinematic teal and orange color palette, film look, high contrast, movie color grading' }, { id: 'cp-14', label: 'Neon Noir', description: 'The electric, futuristic colors of a cyberpunk city at night. Dominated by glowing neons (pinks, blues, purples) against a dark, moody background.', value: 'neon noir color palette, cyberpunk, glowing neon, electric pink, cyan, against a dark background, Blade Runner style' }, ] },
        { key: 'harmonies', category: 'Color Harmonies', description: 'Palettes based on classic color theory for users who want a more technical approach.', options: [ { id: 'cp-15', label: 'Monochromatic', description: 'Sophisticated and cohesive. Uses various shades, tints, and tones of a single color for a clean and elegant effect.', value: 'monochromatic color scheme, shades of blue, single color, tonal, minimalist' }, { id: 'cp-16', label: 'Analogous', description: 'Calm and pleasing. Uses colors that are next to each other on the color wheel (e.g., yellow, yellow-green, and green) for a serene and unified look.', value: 'analogous color scheme, harmonious, pleasing, colors next to each other on the color wheel' }, { id: 'cp-17', label: 'Complementary', description: 'Bold and high-impact. Uses colors that are opposite each other on the color wheel (e.g., red and green) to make each other pop.', value: 'complementary color scheme, high contrast, vibrant, colors opposite on the color wheel' }, { id: 'cp-18', label: 'Faded & Desaturated', description: 'A soft, muted, and often vintage look. Colors are less intense, creating a gentle, understated, and sometimes melancholic mood.', value: 'faded color palette, desaturated colors, muted tones, vintage film look, low saturation' }, ] }
    ],
    composition: [
        { key: 'framing', category: 'Framing & Shot Type', description: 'Controls how close or far the "camera" is and its general perspective.', options: [ { id: 'co-1', label: 'Extreme Close-Up', description: 'Focuses intensely on a single, beautiful detail of your subject, like a flower petal or an eye. Perfect for showing texture and intricate detail.', value: 'extreme close-up, macro shot, macro photography, detailed, intricate textures, super-resolution' }, { id: 'co-2', label: 'Centered Portrait', description: 'Places your main subject front and center. A classic, bold, and direct composition that commands attention. Ideal for single subjects.', value: 'centered composition, symmetrical portrait, subject in the middle, headshot, direct gaze, centered-shot' }, { id: 'co-3', label: 'Wide Landscape', description: 'Shows the big picture. Great for epic scenery, establishing a sense of place, and making your subject part of a larger environment.', value: 'wide shot, wide-angle lens, landscape view, establishing shot, panoramic, cinematic wide angle' }, { id: 'co-4', label: 'Top-Down View / Flat Lay', description: 'Looks straight down at a beautifully arranged scene on a surface. The absolute best choice for card designs, food, and organized objects.', value: 'flat lay composition, top-down view, bird\'s-eye view, neatly arranged, knolling photography' }, { id: 'co-5', label: 'Low Angle Shot', description: 'Looks up at your subject from below. This makes the subject feel powerful, heroic, and larger than life.', value: 'low angle shot, worm\'s-eye view, heroic angle, dramatic, powerful, looming' }, ], },
        { key: 'balance', category: 'Artistic Balance & Placement', description: 'Deals with classic art and design principles for arranging elements.', options: [ { id: 'co-6', label: 'Rule of Thirds', description: 'A timeless classic. Places your subject slightly off-center for a natural, balanced, and visually pleasing look.', value: 'composition following the rule of thirds, off-center subject, asymmetrical balance, visually pleasing' }, { id: 'co-7', label: 'Perfect Symmetry', description: 'Creates a formal, stable, and perfectly balanced image by mirroring the left and right sides. Great for architecture, patterns, and reflections.', value: 'perfectly symmetrical composition, mirrored, balanced, formal, centered, reflection' }, { id: 'co-8', label: 'Minimalist & Clean', description: 'Less is more. Features a single subject with lots of clean, empty space around it for a modern, elegant, and sophisticated feel.', value: 'minimalist composition, lots of negative space, clean, simple, uncluttered, spacious' }, { id: 'co-9', label: 'Frame Within a Frame', description: 'Uses elements in the scene (like a window, an archway, or tree branches) to naturally frame your main subject, adding depth and focus.', value: 'frame within a frame, looking through a window, natural framing, adds depth, layered composition' }, ], },
        { key: 'pattern', category: 'Pattern & Density', description: 'Perfect for card backgrounds and decorative elements.', options: [ { id: 'co-10', label: 'Dense Pattern', description: 'Fills the entire space with a rich, repeating pattern of your subject. Lush, detailed, and visually engaging, like wallpaper or wrapping paper.', value: 'dense pattern, repeating pattern, fills the frame, wallpaper pattern, intricate, seamless pattern' }, { id: 'co-11', label: 'Scattered & Delicate', description: 'Sprinkles your subjects lightly and randomly across the canvas. This creates a playful, delicate, and airy feel, like falling confetti or petals.', value: 'delicately scattered, sparse arrangement, floating, random pattern, airy' }, { id: 'co-12', label: 'Decorative Border', description: 'Arranges elements like flowers, vines, or stars to create a beautiful border around the edges, leaving the center open for your message.', value: 'decorative border, floral frame, framing the composition, wreath design, garland, edge details' }, ], },
        { key: 'cinematic', category: 'Dynamic & Cinematic', description: 'These advanced options create a sense of movement and story.', options: [ { id: 'co-13', label: 'Leading Lines', description: 'Uses lines within the image (a road, a river, a fence) to create a path that guides the viewer\'s eye directly to your main subject.', value: 'leading lines, strong diagonal lines, guides the eye, vanishing point, dynamic composition, one-point perspective' }, { id: 'co-14', label: 'Dynamic Angle (Dutch Angle)', description: 'Tilts the "camera" for a dramatic, unsettling, or energetic feeling. Perfect for action, excitement, and high-impact scenes.', value: 'dutch angle, tilted frame, canted angle, dynamic, off-kilter, action shot' }, { id: 'co-15', label: 'Golden Spiral', description: 'An advanced composition based on a natural spiral (the golden ratio). Creates a perfectly balanced and organic flow that is naturally beautiful to the human eye.', value: 'golden ratio, Fibonacci spiral, perfect composition, organic flow, dynamic symmetry, divine proportion' }, ] }
    ],
    lighting: [
        { key: 'natural', category: 'Natural Light (Time of Day)', description: 'For capturing the feeling of a specific time of day.', options: [ { id: 'li-1', label: 'Golden Hour Glow', description: 'The warm, soft, and nostalgic light just before sunset or after sunrise. Perfect for beautiful portraits and dreamy landscapes.', value: 'golden hour, magic hour, warm soft light, long shadows, cinematic, sunset lighting' }, { id: 'li-2', label: 'Bright Midday Sun', description: 'The strong, direct light of a clear day. Creates vibrant colors and sharp, defined shadows. Great for energetic and lively scenes.', value: 'direct midday sun, harsh shadows, bright sunlight, high contrast, vibrant' }, { id: 'li-3', label: 'Blue Hour Serenity', description: 'The cool, calm, and moody light in the twilight sky just after the sun has set. Creates a serene and often magical atmosphere.', value: 'blue hour, twilight, deep blue sky, cool tones, ambient light, tranquil' }, { id: 'li-4', label: 'Crisp Morning Light', description: 'The clean, clear light of the early morning. It\'s bright but not as harsh as midday, giving a feeling of freshness and optimism.', value: 'soft morning light, crisp, clean, gentle shadows, bright and airy, window light' }, ], },
        { key: 'atmospheric', category: 'Atmospheric & Weather', description: 'For when the weather itself is the source of the mood.', options: [ { id: 'li-5', label: 'Soft & Diffused', description: 'The even, gentle light of an overcast day. It minimizes shadows and is very flattering for subjects. Perfect for a calm, soft look.', value: 'soft diffused light, overcast sky, minimal shadows, even lighting, cloudy day' }, { id: 'li-6', label: 'Dramatic High Contrast', description: 'Strong light and deep, dark shadows. This creates a bold, intense, and focused look, often seen in film noir and fine art.', value: 'high contrast, dramatic lighting, chiaroscuro, hard shadows, film noir style, moody' }, { id: 'li-7', label: 'Dappled Sunlight', description: 'The playful light that filters down through tree leaves, creating a pattern of light and shadow. Evokes a feeling of nature and a peaceful afternoon.', value: 'dappled sunlight, light filtering through leaves, speckled light, forest light' }, { id: 'li-8', label: 'Misty & Ethereal', description: 'Light that passes through fog or mist, creating visible beams and a soft, mysterious, and dreamy atmosphere.', value: 'misty, foggy atmosphere, volumetric light, light rays, god rays, ethereal, moody' }, ], },
        { key: 'cinematic', category: 'Cinematic & Artistic', description: 'For stylized looks that tell a story.', options: [ { id: 'li-9', label: 'Rim Lighting (Backlit)', description: 'The subject is lit from behind, creating a bright, glowing outline or "rim" of light. It\'s dramatic and helps separate the subject from the background.', value: 'rim lighting, backlit, glowing edges, silhouetted, dramatic silhouette' }, { id: 'li-10', label: 'Low-Key Lighting', description: 'The scene is mostly dark, with only a few key areas selectively illuminated. Creates a sense of mystery, intimacy, or drama.', value: 'low-key lighting, dark and moody, deep shadows, selective illumination, mysterious' }, { id: 'li-11', label: 'Cinematic Color Grade', description: 'A professional, movie-like look with stylized colors (like the popular teal and orange look). This option focuses on the color of the light itself.', value: 'cinematic lighting, cinematic color grade, volumetric lighting, moody film look' }, { id: 'li-12', label: 'Professional Studio Light', description: 'The clean, perfect, and controlled lighting of a professional photo studio. Ideal for product shots, fashion, and flawless portraits.', value: 'professional studio lighting, three-point lighting, clean, even light, softbox, flawless' }, ], },
        { key: 'fantastical', category: 'Artificial & Fantastical', description: 'For unique and magical effects that only AI can create perfectly every time.', options: [ { id: 'li-13', label: 'Cozy Candlelight', description: 'The warm, flickering, and intimate glow of candlelight. Perfect for romantic, historical, or cozy holiday scenes.', value: 'lit by candlelight, warm flickering light, intimate, cozy glow, firelight' }, { id: 'li-14', label: 'Neon & Cyberpunk', description: 'The vibrant, electric glow of neon signs in a dark, often rainy, setting. Creates a futuristic, edgy, and high-tech feel.', value: 'neon lighting, cyberpunk, vibrant glowing lights, reflections on wet streets, futuristic' }, { id: 'li-15', label: 'Bioluminescent Glow', description: 'A magical, otherworldly light that seems to come from nature itself—glowing mushrooms, plants, or fantasy creatures.', value: 'bioluminescent, glowing flora, ethereal glow, magical light, fantasy, enchanting' }, { id: 'li-16', label: 'Iridescent & Pearlescent', description: 'A shimmering, multi-colored light that shifts and changes like a soap bubble or an opal. Creates a dreamy, surreal, and magical effect.', value: 'iridescent light, pearlescent, shimmering, opalescent, holographic sheen, rainbow reflections' }, ], },
    ],
    texture: [
        { key: 'paper', category: 'Paper & Canvas Surfaces', description: 'This defines the base material of the card itself, giving it a fundamental feel.', options: [ { id: 'te-1', label: 'Fine Art Paper', description: 'The classic, high-quality feel of a professional art print. Features a subtle, non-uniform grain perfect for watercolor and sketches.', value: 'on heavy cotton paper, watercolor paper texture, cold press paper, visible paper grain, matte finish' }, { id: 'te-2', label: 'Recycled Kraft Paper', description: 'A rustic, eco-friendly look with a visible fibrous texture. Perfect for a natural, handmade, and earthy aesthetic.', value: 'recycled kraft paper, visible fibers, fibrous texture, brown paper, natural, eco-friendly look' }, { id: 'te-3', label: 'Aged Parchment', description: 'The historical, weathered look of an ancient scroll or document. Ideal for fantasy, vintage, or historical themes.', value: 'aged parchment paper, ancient scroll, weathered texture, yellowed edges, historical document, vellum' }, { id: 'te-4', label: 'Artist\'s Canvas', description: 'The distinct woven texture of a painter\'s canvas. This is the perfect base for creating a believable oil or acrylic painting effect.', value: 'on stretched canvas, visible canvas weave, gesso texture, artist\'s canvas, fabric texture' }, ], },
        { key: 'finishes', category: 'Finishes & Accents', description: 'These are the special, decorative layers that add a touch of luxury and dimension.', options: [ { id: 'te-5', label: 'Stamped Gold Foil', description: 'A classic, luxurious effect that adds a metallic shine. This creates the look of real gold leaf pressed onto the paper.', value: 'gold foil accents, stamped gold leaf, metallic shine, reflective gold, gilded, luxurious' }, { id: 'te-6', label: 'Raised Embossing', description: 'A subtle, elegant 3D effect that raises parts of the design from the paper surface. Adds a tactile, high-end feel without using ink.', value: 'embossed design, raised 3D effect, tactile, blind emboss, sculptural paper' }, { id: 'te-7', label: 'Letterpress Impression', description: 'A sophisticated and classic printing effect where the design is pressed into the paper, creating a deep, tactile impression.', value: 'letterpress effect, deep impression in paper, inked debossing, artisan quality, tactile' }, { id: 'te-8', label: 'Holographic & Iridescent Foil', description: 'A modern, magical foil that shimmers with a rainbow of colors as the light changes. Perfect for fun, futuristic, or fantasy themes.', value: 'holographic foil, iridescent finish, rainbow sheen, opalescent, shimmering, pearlescent' }, { id: 'te-9', label: 'Sparkling Glitter', description: 'Adds a festive, sparkling, and fun texture. Use this for celebratory cards that need an extra pop of shimmer and excitement.', value: 'sparkling glitter accents, shimmer, glistening particles, festive sparkle, textured glitter' }, ], },
        { key: 'distressed', category: 'Artistic & Distressed Textures', description: 'These textures are about adding a layer of artistic style or age to the entire image.', options: [ { id: 'te-10', label: 'Cracked Paint (Craquelure)', description: 'The fine network of cracks that appear on an old oil painting. Instantly gives your image an antique, museum-quality, and weathered feel.', value: 'craquelure, cracked paint texture, aged oil painting, distressed finish, vintage patina, weathered' }, { id: 'te-11', label: 'Heavy Impasto', description: 'This mimics the thick, three-dimensional application of paint, showing every stroke from the palette knife or brush. Perfect for expressive oil paintings.', value: 'heavy impasto, thick paint, visible palette knife strokes, textured brushwork, 3D paint' }, { id: 'te-12', label: 'Grainy Retro Print', description: 'The characteristic grainy texture of vintage printing methods like Risograph or screenprinting. Adds a cool, retro, and handmade vibe.', value: 'grainy texture, risograph texture, halftone dots, screenprint look, retro print, vintage' }, ], },
        { key: 'fabric', category: 'Fabric & Textile Textures', description: 'For creating a unique, soft, and unconventional card that feels like it\'s made of fabric.', options: [ { id: 'te-13', label: 'Linen Weave', description: 'The clean, cross-hatched pattern of linen fabric. Adds a touch of elegance and sophistication to the background.', value: 'on linen fabric, woven texture, textile background, canvas weave, elegant fabric' }, { id: 'te-14', label: 'Rustic Burlap', description: 'The coarse, open weave of burlap or hessian fabric. Perfect for a rustic, farmhouse, or natural theme.', value: 'burlap texture, hessian weave, coarse jute fabric, rustic, natural fibers, tactile' }, { id: 'te-15', label: 'Soft Felt', description: 'The soft, matted fiber look of pressed felt. Evokes a cozy, handcrafted, and often child-friendly feeling.', value: 'pressed felt texture, soft, matted fibers, handcrafted look, cozy, textile art' }, ], },
    ],
};

// --- Main Component: DeveloperStudioPage ---
export default function DeveloperStudioPage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedCardUri, setGeneratedCardUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const toast = useToast();

  const handleGeneration = async (generationFn: () => Promise<{cardDataUri: string}>) => {
    setGenerationState('generating');
    setErrorMessage(null);
    setGeneratedCardUri(null);

    try {
      const result = await generationFn();
      setGeneratedCardUri(result.cardDataUri);
      setGenerationState('done');
      toast({
        title: 'Image Generated!',
        description: 'Your new image is ready in the Developer Studio.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setGenerationState('error');
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: message,
      });
    }
  };

  const ResultCard = () => (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Result</CardTitle>
      </CardHeader>
      <CardContent>
        <Card className="relative flex items-center justify-center bg-muted/50 border-dashed aspect-video">
          {generationState === 'generating' && (
            <div className="text-center text-muted-foreground">
              <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
              <p>Generating...</p>
            </div>
          )}
          {generationState === 'done' && generatedCardUri && (
            <Image src={generatedCardUri} alt="Generated image result" fill className="object-contain rounded-md" />
          )}
          {generationState === 'idle' && !generatedCardUri && (
            <p className="text-muted-foreground p-4 text-center">Your generated image will appear here.</p>
          )}
          {generationState === 'error' && (
            <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
          )}
        </Card>
      </CardContent>
      {generationState === 'done' && (
        <CardFooter className="flex-col gap-2">
            <Button className="w-full" variant="secondary">
                <FilePlus className="mr-2 h-4 w-4" /> Add to Signature Studio
            </Button>
            <div className="grid grid-cols-2 gap-2 w-full">
                <Button onClick={() => { setGeneratedCardUri(null); setGenerationState('idle'); }} variant="outline">
                    <Repeat className="mr-2 h-4 w-4" /> Start Over
                </Button>
                <a href={generatedCardUri!} download="dev-studio-creation.png">
                    <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                </a>
            </div>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Developer Studio
        </h1>
        <p className="text-muted-foreground">
          Create, test, and curate creative assets for the app.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
           <Tabs defaultValue="ai-studio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-studio">AI Studio</TabsTrigger>
              <TabsTrigger value="remix-studio">Remix Studio</TabsTrigger>
            </TabsList>
            <TabsContent value="ai-studio">
              <AiStudioTab onGenerate={handleGeneration} setPromptOutput={{setPositivePrompt, setNegativePrompt}} />
            </TabsContent>
            <TabsContent value="remix-studio">
              <RemixStudioTab onGenerate={handleGeneration} setPromptOutput={{setPositivePrompt, setNegativePrompt}} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
            <ResultCard />
            <PromptInspector positivePrompt={positivePrompt} negativePrompt={negativePrompt} />
        </div>
      </div>
    </div>
  );
}


// --- Tab 1: AI Studio ---

const aiStudioFormSchema = z.object({
  personalizedPrompt: z.string().min(10, {
    message: 'Please describe your card in at least 10 characters.',
  }),
});

function AiStudioTab({ onGenerate, setPromptOutput }: { onGenerate: Function, setPromptOutput: any }) {
    const form = useForm<z.infer<typeof aiStudioFormSchema>>({
        resolver: zodResolver(aiStudioFormSchema),
        defaultValues: { personalizedPrompt: '' },
    });

    const [artisticMedium, setArtisticMedium] = useState<ArtisticMediumState>({});
    const [colorPalette, setColorPalette] = useState<ColorPaletteState>({});
    const [composition, setComposition] = useState<CompositionState>({});
    const [lighting, setLighting] = useState<LightingState>({});
    const [texture, setTexture] = useState<TextureState>({});
    const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        aspectRatio: true,
        artisticMedium: false, colorPalette: false, composition: false, lighting: false, texture: false
    });
    
    // This is a simplified version for the dev studio
    const onSubmit = (data: z.infer<typeof aiStudioFormSchema>) => {
        const fullArtisticMediumPrompt = Object.values(artisticMedium).filter(Boolean).join(', ');
        const fullCompositionPrompt = Object.values(composition).filter(Boolean).join(', ');
        const fullLightingPrompt = Object.values(lighting).filter(Boolean).join(', ');
        const fullColorPalettePrompt = Object.values(colorPalette).filter(Boolean).join(', ');
        const fullTexturePrompt = Object.values(texture).filter(Boolean).join(', ');

        const finalPrompt = [
            data.personalizedPrompt,
            fullArtisticMediumPrompt,
            fullCompositionPrompt,
            fullLightingPrompt,
            fullColorPalettePrompt,
            fullTexturePrompt,
        ].filter(Boolean).join(', ');

        setPromptOutput.setPositivePrompt(finalPrompt); // Update inspector

        const generationFn = () => generateCardAction({
            masterPrompt: 'Developer Studio Generation',
            personalizedPrompt: finalPrompt,
            aspectRatio: aspectRatio,
        });

        onGenerate(generationFn);
    };

    const isLoading = form.formState.isSubmitting;

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Studio</CardTitle>
                <CardDescription>Generate images from a text prompt and detailed refinements.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="personalizedPrompt"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-base">Describe what you want to create</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., 'A watercolor painting of a calico cat wearing a tiny crown...'" rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/> Refinements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <RefinementSection title="Aspect Ratio" options={[{id: 'ar-p', label: 'Portrait (9:16)', value: '9:16'}, {id: 'ar-l', label: 'Landscape (16:9)', value: '16:9'}, {id: 'ar-s', label: 'Square (1:1)', value: '1:1'}]} value={aspectRatio} onValueChange={setAspectRatio} categoryKey="aspectRatio" />
                                <RefinementSection title="Artistic Medium" options={refinementOptions.artisticMedium} value={artisticMedium} onValueChange={setArtisticMedium} categoryKey="artisticMedium" />
                                <RefinementSection title="Color Palette" options={refinementOptions.colorPalette} value={colorPalette} onValueChange={setColorPalette} categoryKey="colorPalette" />
                                <RefinementSection title="Composition" options={refinementOptions.composition} value={composition} onValueChange={setComposition} categoryKey="composition" />
                                <RefinementSection title="Lighting" options={refinementOptions.lighting} value={lighting} onValueChange={setLighting} categoryKey="lighting" />
                                <RefinementSection title="Texture & Finish" options={refinementOptions.texture} value={texture} onValueChange={setTexture} categoryKey="texture" />
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Image
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

// --- Tab 2: Remix Studio ---

function RemixStudioTab({ onGenerate, setPromptOutput }: { onGenerate: Function, setPromptOutput: any }) {
    return (
        <div className="space-y-6">
            <RemixStyle onGenerate={onGenerate} setPromptOutput={setPromptOutput} />
            <Separator />
            <ModifyImage onGenerate={onGenerate} setPromptOutput={setPromptOutput} />
        </div>
    )
}

const remixStyleSchema = z.object({
  prompt: z.string().min(10, 'Please describe your desired image content.'),
  styleImage: z.any().refine(fileList => fileList.length === 1, 'Please upload one style image.'),
  layoutLock: z.boolean(),
});

function RemixStyle({ onGenerate, setPromptOutput }: { onGenerate: Function, setPromptOutput: any }) {
  const form = useForm<z.infer<typeof remixStyleSchema>>({ resolver: zodResolver(remixStyleSchema), defaultValues: { prompt: '', styleImage: undefined, layoutLock: false } });
  const [stylePreview, setStylePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('styleImage', e.target.files);
      const reader = new FileReader();
      reader.onload = (loadEvent) => setStylePreview(loadEvent.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof remixStyleSchema>) => {
    const imageFile = data.styleImage[0] as File;
    const photoDataUri = await fileToBase64(imageFile);

    setPromptOutput.setPositivePrompt(data.prompt); // Update inspector
    setPromptOutput.setNegativePrompt('');

    const generationFn = () => generateCardAction({
        masterPrompt: data.layoutLock ? "Generate using reference layout." : "Apply style from reference image.",
        personalizedPrompt: data.prompt,
        photoDataUri: photoDataUri,
        layoutLock: data.layoutLock,
    });
    onGenerate(generationFn);
  };
  
  return (
    <Card>
        <CardHeader>
            <CardTitle>Remix with Style (IP-Adapter)</CardTitle>
            <CardDescription>Upload a style reference, then describe the new image content.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Form fields for style image upload and prompt */}
                    <div className="grid md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="styleImage" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Style Reference Image</FormLabel>
                                <FormControl><Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" /></FormControl>
                                <Card className="border-2 border-dashed hover:border-primary cursor-pointer aspect-video flex items-center justify-center text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                                    {stylePreview ? <Image src={stylePreview} alt="Style preview" width={400} height={250} className="object-contain h-full w-full rounded-md" /> : <div className="text-center"><UploadCloud className="mx-auto h-12 w-12" /><p>Click to upload</p></div>}
                                </Card>
                                <FormMessage />
                            </FormItem>
                         )} />
                        <div className="space-y-4">
                             <FormField control={form.control} name="prompt" render={({ field }) => (
                                <FormItem>
                                <FormLabel>New Image Content</FormLabel>
                                <FormControl><Textarea placeholder="e.g., 'A portrait of a robot cat'" rows={4} {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="layoutLock" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
                                    <div className="space-y-0.5"><FormLabel>Lock Original Composition</FormLabel><CardDescription>Keeps the layout, replaces the style.</CardDescription></div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Generate Remix</Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}

const modifyImageSchema = z.object({
  prompt: z.string().min(5, 'Please describe your desired modification.'),
  baseImage: z.any().refine(fileList => fileList.length === 1, 'Please upload one image file.'),
  strength: z.number().min(0.1).max(1.0),
});

function ModifyImage({ onGenerate, setPromptOutput }: { onGenerate: Function, setPromptOutput: any }) {
  const form = useForm<z.infer<typeof modifyImageSchema>>({ resolver: zodResolver(modifyImageSchema), defaultValues: { prompt: '', baseImage: undefined, strength: 0.5 } });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [strengthLabel, setStrengthLabel] = useState('Balanced');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('baseImage', e.target.files);
      const reader = new FileReader();
      reader.onload = (loadEvent) => setImagePreview(loadEvent.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof modifyImageSchema>) => {
    const imageFile = data.baseImage[0] as File;
    const photoDataUri = await fileToBase64(imageFile);
    
    setPromptOutput.setPositivePrompt(data.prompt);
    setPromptOutput.setNegativePrompt('');

    const generationFn = () => generateCardAction({
        masterPrompt: "Modify the provided image.",
        personalizedPrompt: data.prompt,
        photoDataUri: photoDataUri,
        modificationStrength: data.strength,
    });
    onGenerate(generationFn);
  };
  
  const handleStrengthChange = (value: number[]) => {
    const strength = value[0];
    form.setValue('strength', strength);
    if (strength <= 0.3) setStrengthLabel('Subtle Changes');
    else if (strength <= 0.7) setStrengthLabel('Balanced');
    else setStrengthLabel('Major Transformation');
  }
  
  return (
     <Card>
        <CardHeader>
            <CardTitle>Modify This Image (img2img)</CardTitle>
            <CardDescription>Upload a starting image, then use a prompt and sliders to transform it.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="baseImage" render={() => (
                            <FormItem>
                                <FormLabel>Base Image</FormLabel>
                                <FormControl><Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" /></FormControl>
                                <Card className="border-2 border-dashed hover:border-primary cursor-pointer aspect-video flex items-center justify-center text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                                    {imagePreview ? <Image src={imagePreview} alt="Base image preview" width={400} height={250} className="object-contain h-full w-full rounded-md" /> : <div className="text-center"><UploadCloud className="mx-auto h-12 w-12" /><p>Click to upload</p></div>}
                                </Card>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="space-y-4">
                            <FormField control={form.control} name="prompt" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Describe Your Changes</FormLabel>
                                <FormControl><Textarea placeholder="e.g., 'Change the dog to a cat'" rows={3} {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="strength" render={() => (
                                <FormItem>
                                    <FormLabel>Modification Strength: <span className="font-bold text-primary">{strengthLabel}</span></FormLabel>
                                    <FormControl><Slider defaultValue={[0.5]} min={0.1} max={1.0} step={0.05} onValueChange={handleStrengthChange} /></FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">Generate Modification</Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}


// --- Prompt Inspector Panel ---

function PromptInspector({ positivePrompt, negativePrompt }: { positivePrompt: string, negativePrompt: string }) {
    const { toast } = useToast();

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${type} prompt copied!` });
    };

    return (
        <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="w-full">
                <Card>
                    <CardHeader className="p-4 flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2"><Bot className="h-5 w-5 text-primary"/> Prompt Inspector</CardTitle>
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </CardHeader>
                </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <Card className="mt-2">
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="positive-prompt">Final Positive Prompt</Label>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(positivePrompt, 'Positive')}><Copy className="h-4 w-4" /></Button>
                            </div>
                            <Textarea id="positive-prompt" readOnly value={positivePrompt || "Prompt will appear here..."} rows={6} className="text-xs font-mono" />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="negative-prompt">Final Negative Prompt</Label>
                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(negativePrompt, 'Negative')}><Copy className="h-4 w-4" /></Button>
                            </div>
                            <Textarea id="negative-prompt" readOnly value={negativePrompt || "Negative prompt will appear here..."} rows={3} className="text-xs font-mono" />
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Prompt Breakdown (placeholder)</h4>
                            <div className="space-y-2 text-xs">
                                <p><Badge variant="secondary">Master Prompt</Badge> <span>(e.g., from a Moment or Signature template)</span></p>
                                <p><Badge variant="secondary">User Input</Badge> <span>(Text from the main prompt box)</span></p>
                                <p><Badge variant="outline">Refinement: Medium</Badge> <span>delicate watercolor...</span></p>
                                <p><Badge variant="outline">Refinement: Lighting</Badge> <span>golden hour...</span></p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CollapsibleContent>
        </Collapsible>
    )
}

// --- Reusable Helper Components & Functions ---

const RefinementSection = ({ title, options, value, onValueChange, categoryKey }: { title: string, options: any[], value: any, onValueChange: (value: any) => void, categoryKey: string }) => {
    const isMultiSelect = ['composition', 'lighting', 'artisticMedium', 'colorPalette', 'texture'].includes(categoryKey);
    const [isOpen, setIsOpen] = useState(categoryKey === 'aspectRatio');

    const handleValueChange = (val: any) => {
        onValueChange(val);
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
                <span className="font-semibold">{title}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2">
                {isMultiSelect ? (
                    options.map(category => (
                    <div key={category.category} className="mt-4 first:mt-0">
                        <h4 className="font-semibold text-sm mb-1">{category.category}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                        <RadioGroup value={value[category.key]} onValueChange={(selectedValue) => handleValueChange({ ...value, [category.key]: selectedValue })} className="grid gap-2">
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
                        {value[category.key] && <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => handleValueChange({ ...value, [category.key]: undefined })}><XCircle className="mr-1 h-4 w-4" />Clear</Button>}
                    </div>
                    ))
                ) : (
                    <RadioGroup value={value} onValueChange={handleValueChange}>
                        {options.map((option:any) => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={option.id} />
                                <Label htmlFor={option.id}>{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            </CollapsibleContent>
        </Collapsible>
    )
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

    
