import type { LucideIcon } from 'lucide-react';
import { Cake, Gift, GraduationCap, Heart, Users, Star } from 'lucide-react';
import { PlaceHolderImages as allImages } from './placeholder-images';

export const placeholderImages = allImages;

export type Occasion = {
  id: 'birthday' | 'holiday' | 'wedding' | 'graduation' | 'lovers' | 'group';
  name: string;
  icon: LucideIcon;
};

export const occasions: Occasion[] = [
  { id: 'birthday', name: 'Birthday', icon: Cake },
  { id: 'holiday', name: 'Holiday', icon: Gift },
  { id: 'wedding', name: 'Wedding', icon: Heart },
  { id: 'graduation', name: 'Graduation', icon: GraduationCap },
  { id: 'lovers', name: 'Lovers', icon: Heart },
  { id: 'group', name: 'Group Card', icon: Users },
];

export type CardTemplate = {
  id: string;
  occasion: Occasion['id'];
  name: string;
  imageId: string;
};

export const templates: CardTemplate[] = [
  { id: 'bday-t-1', occasion: 'birthday', name: 'Watercolor Wonder', imageId: 'template-birthday-1' },
  { id: 'bday-t-2', occasion: 'birthday', name: 'Festive Fun', imageId: 'template-birthday-2' },
  { id: 'bday-t-3', occasion: 'birthday', name: 'Golden Elegance', imageId: 'template-birthday-3' },
  { id: 'bday-t-4', occasion: 'birthday', name: 'Minimalist Flower', imageId: 'template-birthday-4' },
  { id: 'bday-t-5', occasion: 'birthday', name: 'Party Animal', imageId: 'template-birthday-5' },
  { id: 'holi-t-1', occasion: 'holiday', name: 'Snowy Peace', imageId: 'template-holiday-1' },
  { id: 'holi-t-2', occasion: 'holiday', name: 'New Year Blast', imageId: 'template-holiday-2' },
  { id: 'holi-t-3', occasion: 'holiday', name: 'Ornament Joy', imageId: 'template-holiday-3' },
  { id: 'holi-t-4', occasion: 'holiday', name: 'Cozy Fireplace', imageId: 'template-holiday-4' },
  { id: 'holi-t-5', occasion: 'holiday', name: 'Geometric Cheer', imageId: 'template-holiday-5' },
  { id: 'wed-t-1', occasion: 'wedding', name: 'Floral Dreams', imageId: 'template-wedding-1' },
  { id: 'wed-t-2', occasion: 'wedding', name: 'Eternal Rings', imageId: 'template-wedding-2' },
  { id: 'wed-t-3', occasion: 'wedding', name: 'Simple Vows', imageId: 'template-wedding-3' },
  { id: 'wed-t-4', occasion: 'wedding', name: 'Rustic Charm', imageId: 'template-wedding-4' },
  { id: 'wed-t-5', occasion: 'wedding', name: 'Golden Union', imageId: 'template-wedding-5' },
];

export type MasterPrompt = {
  id: string;
  occasion: Occasion['id'];
  name: string;
  prompt: string;
  imageId: string;
};

export const masterPrompts: MasterPrompt[] = [
  { id: 'bday-mp-1', occasion: 'birthday', name: 'Vibrant Abstract', prompt: 'A birthday card in the style of vibrant, energetic, and celebratory abstract art. Use bold colors and dynamic shapes.', imageId: 'master-prompt-birthday-1' },
  { id: 'bday-mp-2', occasion: 'birthday', name: 'Pastel Serenity', prompt: 'A birthday card with a calm, serene, and gentle theme. Use soft pastel colors and flowing lines.', imageId: 'master-prompt-birthday-2' },
  { id: 'bday-mp-3', occasion: 'birthday', name: 'Photorealistic', prompt: 'A photorealistic image of a birthday scene. Focus on details, lighting, and textures.', imageId: 'master-prompt-birthday-3' },
  { id: 'bday-mp-4', occasion: 'birthday', name: 'Retro 80s', prompt: 'A birthday card with a retro 1980s theme. Think neon colors, geometric patterns, and a fun, nostalgic vibe.', imageId: 'master-prompt-birthday-4' },
  { id: 'bday-mp-5', occasion: 'birthday', name: 'Futuristic Sci-Fi', prompt: 'A birthday card with a futuristic, science-fiction theme. Imagine holographic elements, sleek lines, and a high-tech feel.', imageId: 'master-prompt-birthday-5' },
  { id: 'holi-mp-1', occasion: 'holiday', name: 'Traditional Christmas', prompt: 'A classic, traditional Christmas card scene. Include elements like a decorated tree, fireplace, and a sense of warmth and nostalgia.', imageId: 'master-prompt-holiday-1' },
  { id: 'holi-mp-2', occasion: 'holiday', name: 'Modern Minimalist', prompt: 'A modern and minimalist holiday design. Use clean lines, simple shapes, and a limited color palette for an elegant feel.', imageId: 'master-prompt-holiday-2' },
  { id: 'holi-mp-3', occasion: 'holiday', name: 'Watercolor Wonderland', prompt: 'A beautiful watercolor painting of a winter wonderland. Soft-edged, dreamy, and filled with light.', imageId: 'master-prompt-holiday-3' },
  { id: 'holi-mp-4', occasion: 'holiday', name: 'Cozy Hygge', prompt: 'A cozy, hygge-inspired holiday card. Evoke feelings of comfort, warmth, and simple joys.', imageId: 'master-prompt-holiday-4' },
  { id: 'holi-mp-5', occasion: 'holiday', name: 'Festive New Year', prompt: 'A bright and festive New Year\'s celebration. Think fireworks, champagne, and a sense of excitement and hope.', imageId: 'master-prompt-holiday-5' },
  { id: 'wed-mp-1', occasion: 'wedding', name: 'Romantic Floral', prompt: 'An elegant and romantic wedding design dominated by beautiful, lush flowers. Soft, dreamy, and classic.', imageId: 'master-prompt-wedding-1' },
  { id: 'wed-mp-2', occasion: 'wedding', name: 'Art Deco', prompt: 'A vintage, Art Deco style wedding invitation. Use strong geometric shapes, metallic accents, and a sense of 1920s glamour.', imageId: 'master-prompt-wedding-2' },
  { id: 'wed-mp-3', occasion: 'wedding', name: 'Bohemian Spirit', prompt: 'A bohemian, free-spirited wedding card. Think natural elements, earthy tones, and a relaxed, artistic vibe.', imageId: 'master-prompt-wedding-3' },
  { id: 'wed-mp-4', occasion: 'wedding', name: 'Modern Geometric', prompt: 'A clean, modern wedding design featuring geometric patterns and shapes. Minimalist, chic, and contemporary.', imageId: 'master-prompt-wedding-4' },
  { id: 'wed-mp-5', occasion: 'wedding', name: 'Luxury Gold', prompt: 'A luxurious and opulent wedding card with rich textures and prominent gold accents. Evokes a sense of grandeur and elegance.', imageId: 'master-prompt-wedding-5' },
];

export const historyItems = [
    {
        id: 'hist-1',
        prompt: 'A cute cat wearing a tiny birthday party hat, watercolor style.',
        masterPrompt: 'A birthday card with a calm, serene, and gentle theme. Use soft pastel colors and flowing lines.',
        imageId: 'history-1',
        createdAt: '2 days ago'
    },
    {
        id: 'hist-2',
        prompt: 'A dramatic sunset over a calm ocean, with two people walking on the beach.',
        masterPrompt: 'An elegant and romantic design dominated by beautiful, lush flowers. Soft, dreamy, and classic.',
        imageId: 'history-2',
        createdAt: '5 days ago'
    },
    {
        id: 'hist-3',
        prompt: 'A sprawling, brightly lit futuristic city at night, with flying cars.',
        masterPrompt: 'A birthday card with a futuristic, science-fiction theme. Imagine holographic elements, sleek lines, and a high-tech feel.',
        imageId: 'history-3',
        createdAt: '1 week ago'
    }
]
