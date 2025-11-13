import type { LucideIcon } from 'lucide-react';
import { Cake, Gift, GraduationCap, Heart, Users, Camera } from 'lucide-react';
import { PlaceHolderImages as allImages } from './placeholder-images';

export const placeholderImages = allImages;

export type Occasion = {
  id: 'birthday' | 'holiday' | 'wedding' | 'graduation' | 'lovers' | 'group' | 'postcard';
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
  { id: 'postcard', name: 'Postcard', icon: Camera },
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
  { id: 'bday-t-6', occasion: 'birthday', name: 'Cosmic Celebration', imageId: 'template-birthday-6' },
  { id: 'bday-t-7', occasion: 'birthday', name: 'Modern Geometric', imageId: 'template-birthday-7' },
  { id: 'bday-t-8', occasion: 'birthday', name: 'Vintage Charm', imageId: 'template-birthday-8' },
  { id: 'bday-t-9', occasion: 'birthday', name: 'Gamer\'s Delight', imageId: 'template-birthday-9' },
  { id: 'bday-t-10', occasion: 'birthday', name: 'Tropical Vibes', imageId: 'template-birthday-10' },
  { id: 'bday-t-11', occasion: 'birthday', name: 'Sweet Cupcake', imageId: 'template-birthday-11' },
  { id: 'bday-t-12', occasion: 'birthday', name: 'Rockstar Stage', imageId: 'template-birthday-12' },
  { id: 'bday-t-13', occasion: 'birthday', name: 'Dinosaur Rawr', imageId: 'template-birthday-13' },
  { id: 'bday-t-14', occasion: 'birthday', name: 'Elegant Script', imageId: 'template-birthday-14' },
  { id: 'bday-t-15', occasion: 'birthday', name: 'Under the Sea', imageId: 'template-birthday-15' },
  { id: 'bday-t-16', occasion: 'birthday', name: 'Superhero Blast', imageId: 'template-birthday-16' },
  { id: 'bday-t-17', occasion: 'birthday', name: 'Floral Wreath', imageId: 'template-birthday-17' },
  { id: 'bday-t-18', occasion: 'birthday', name: 'Hot Air Balloons', imageId: 'template-birthday-18' },
  { id: 'bday-t-19', occasion: 'birthday', name: 'Book Lover', imageId: 'template-birthday-19' },
  { id: 'bday-t-20', occasion: 'birthday', name: 'Art Deco Glam', imageId: 'template-birthday-20' },
  { id: 'holi-t-1', occasion: 'holiday', name: 'Snowy Peace', imageId: 'template-holiday-1' },
  { id: 'holi-t-2', occasion: 'holiday', name: 'New Year Blast', imageId: 'template-holiday-2' },
  { id: 'holi-t-3', occasion: 'holiday', name: 'Ornament Joy', imageId: 'template-holiday-3' },
  { id: 'holi-t-4', occasion: 'holiday', name: 'Cozy Fireplace', imageId: 'template-holiday-4' },
  { id: 'holi-t-5', occasion: 'holiday', name: 'Geometric Cheer', imageId: 'template-holiday-5' },
  { id: 'holi-t-6', occasion: 'holiday', name: 'Winter Village', imageId: 'template-holiday-6' },
  { id: 'holi-t-7', occasion: 'holiday', name: 'Holly Jolly', imageId: 'template-holiday-7' },
  { id: 'holi-t-8', occasion: 'holiday', name: 'Elegant Snowflakes', imageId: 'template-holiday-8' },
  { id: 'holi-t-9', occasion: 'holiday', name: 'Gingerbread Fun', imageId: 'template-holiday-9' },
  { id: 'holi-t-10', occasion: 'holiday', name: 'Reindeer Greetings', imageId: 'template-holiday-10' },
  { id: 'holi-t-11', occasion: 'holiday', name: 'Hanukkah Lights', imageId: 'template-holiday-11' },
  { id: 'holi-t-12', occasion: 'holiday', name: 'Kwanzaa Unity', imageId: 'template-holiday-12' },
  { id: 'holi-t-13', occasion: 'holiday', name: 'Tropical Christmas', imageId: 'template-holiday-13' },
  { id: 'holi-t-14', occasion: 'holiday', name: 'Vintage Santa', imageId: 'template-holiday-14' },
  { id: 'holi-t-15', occasion: 'holiday', name: 'Polar Bear Hug', imageId: 'template-holiday-15' },
  { id: 'holi-t-16', occasion: 'holiday', name: 'New Year Countdown', imageId: 'template-holiday-16' },
  { id: 'holi-t-17', occasion: 'holiday', name: 'Mistletoe Kiss', imageId: 'template-holiday-17' },
  { id: 'holi-t-18', occasion: 'holiday', name: 'Penguin Party', imageId: 'template-holiday-18' },
  { id: 'holi-t-19', occasion: 'holiday', name: 'Gilded Greetings', imageId: 'template-holiday-19' },
  { id: 'holi-t-20', occasion: 'holiday', name: 'Folk Art Christmas', imageId: 'template-holiday-20' },
  { id: 'wed-t-1', occasion: 'wedding', name: 'Floral Dreams', imageId: 'template-wedding-1' },
  { id: 'wed-t-2', occasion: 'wedding', name: 'Eternal Rings', imageId: 'template-wedding-2' },
  { id: 'wed-t-3', occasion: 'wedding', name: 'Simple Vows', imageId: 'template-wedding-3' },
  { id: 'wed-t-4', occasion: 'wedding', name: 'Rustic Charm', imageId: 'template-wedding-4' },
  { id: 'wed-t-5', occasion: 'wedding', name: 'Golden Union', imageId: 'template-wedding-5' },
  { id: 'wed-t-6', occasion: 'wedding', name: 'Beach Sunset', imageId: 'template-wedding-6' },
  { id: 'wed-t-7', occasion: 'wedding', name: 'Mountain Majesty', imageId: 'template-wedding-7' },
  { id: 'wed-t-8', occasion: 'wedding', name: 'City Lights', imageId: 'template-wedding-8' },
  { id: 'wed-t-9', occasion: 'wedding', name: 'Watercolor Love', imageId: 'template-wedding-9' },
  { id: 'wed-t-10', occasion: 'wedding', name: 'Art Deco Affair', imageId: 'template-wedding-10' },
  { id: 'wed-t-11', occasion: 'wedding', name: 'Boho Chic', imageId: 'template-wedding-11' },
  { id: 'wed-t-12', occasion: 'wedding', name: 'Fairytale Castle', imageId: 'template-wedding-12' },
  { id: 'wed-t-13', occasion: 'wedding', name: 'Minimalist Modern', imageId: 'template-wedding-13' },
  { id: 'wed-t-14', occasion: 'wedding', name: 'Vintage Lace', imageId: 'template-wedding-14' },
  { id: 'wed-t-15', occasion: 'wedding', name: 'Starry Night', imageId: 'template-wedding-15' },
  { id: 'wed-t-16', occasion: 'wedding', name: 'Two Hearts', imageId: 'template-wedding-16' },
  { id: 'wed-t-17', occasion: 'wedding', name: 'Elegant Calligraphy', imageId: 'template-wedding-17' },
  { id: 'wed-t-18', occasion: 'wedding', name: 'Vineyard Vows', imageId: 'template-wedding-18' },
  { id: 'wed-t-19', occasion: 'wedding', name: 'Abstract Union', imageId: 'template-wedding-19' },
  { id: 'wed-t-20', occasion: 'wedding', name: 'Passport to Love', imageId: 'template-wedding-20' },
  { id: 'grad-t-1', occasion: 'graduation', name: 'The Tassel', imageId: 'template-graduation-1' },
  { id: 'grad-t-2', occasion: 'graduation', name: 'Future is Bright', imageId: 'template-graduation-2' },
  { id: 'grad-t-3', occasion: 'graduation', name: 'Class of 2024', imageId: 'template-graduation-3' },
  { id: 'grad-t-4', occasion: 'graduation', name: 'Adventure Awaits', imageId: 'template-graduation-4' },
  { id: 'grad-t-5', occasion: 'graduation', name: 'Scholarly Script', imageId: 'template-graduation-5' },
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
  { id: 'postcard-mp-1', occasion: 'postcard', name: 'Postcard Style', prompt: 'Create a postcard based on the provided image. Add creative elements and text to make it look like a real postcard.', imageId: 'master-prompt-postcard-1' }
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
