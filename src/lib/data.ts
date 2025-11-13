
import type { LucideIcon } from 'lucide-react';
import { Cake, Gift, GraduationCap, Heart, Users, Camera, Mountain, Building, Zap } from 'lucide-react';
import { PlaceHolderImages as allImages } from './placeholder-images';

export const placeholderImages = allImages;

export type Occasion = {
  id: 'birthday' | 'holiday' | 'wedding' | 'graduation' | 'lovers' | 'group' | 'postcard' | 'nature' | 'architecture' | 'abstract';
  name: string;
  icon: LucideIcon;
};

export const allOccasions: Occasion[] = [
  { id: 'birthday', name: 'Birthday', icon: Cake },
  { id: 'holiday', name: 'Holiday', icon: Gift },
  { id: 'wedding', name: 'Wedding', icon: Heart },
  { id: 'graduation', name: 'Graduation', icon: GraduationCap },
  { id: 'lovers', name: 'Lovers', icon: Heart },
  { id: 'group', name: 'Group Card', icon: Users },
  { id: 'postcard', name: 'Postcard', icon: Camera },
  { id: 'nature', name: 'Nature', icon: Mountain },
  { id: 'architecture', name: 'Architecture', icon: Building },
  { id: 'abstract', name: 'Abstract', icon: Zap },
];

export const occasions: Occasion[] = allOccasions.filter(o => !['nature', 'architecture', 'abstract', 'lovers', 'group'].includes(o.id));
export const templateOccasions: Occasion[] = allOccasions.filter(o => ['nature', 'architecture', 'abstract', 'birthday', 'holiday', 'wedding', 'graduation'].includes(o.id));


export type CardTemplate = {
  id: string;
  occasion: Occasion['id'];
  name: string;
  imageId: string;
};

export const templates: CardTemplate[] = [
  // Nature
  { id: 'nature-t-1', occasion: 'nature', name: 'Mountain Lake', imageId: 'hero' },
  { id: 'nature-t-2', occasion: 'nature', name: 'Minimalist Flower', imageId: 'template-birthday-4' },
  { id: 'nature-t-3', occasion: 'nature', name: 'Tropical Vibes', imageId: 'template-birthday-10' },
  { id: 'nature-t-4', occasion: 'nature', name: 'Under the Sea', imageId: 'template-birthday-15' },
  { id: 'nature-t-5', occasion: 'nature', name: 'Floral Wreath', imageId: 'template-birthday-17' },
  { id: 'nature-t-6', occasion: 'nature', name: 'Hot Air Balloons', imageId: 'template-birthday-18' },
  { id: 'nature-t-7', occasion: 'nature', name: 'Snowy Peace', imageId: 'template-holiday-1' },
  { id: 'nature-t-8', occasion: 'nature', name: 'Beach Sunset', imageId: 'template-wedding-6' },
  { id: 'nature-t-9', occasion: 'nature', name: 'Mountain Majesty', imageId: 'template-wedding-7' },
  { id: 'nature-t-10', occasion: 'nature', name: 'Starry Night', imageId: 'template-wedding-15' },

  // Architecture
  { id: 'arch-t-1', occasion: 'architecture', name: 'Cozy Fireplace', imageId: 'template-holiday-4' },
  { id: 'arch-t-2', occasion: 'architecture', name: 'Winter Village', imageId: 'template-holiday-6' },
  { id: 'arch-t-3', occasion: 'architecture', name: 'City Lights', imageId: 'template-wedding-8' },
  { id: 'arch-t-4', occasion: 'architecture', name: 'Fairytale Castle', imageId: 'template-wedding-12' },
  { id: 'arch-t-5', occasion: 'architecture', name: 'Vineyard Vows', imageId: 'template-wedding-18' },

  // Abstract
  { id: 'abstract-t-1', occasion: 'abstract', name: 'Watercolor Wonder', imageId: 'template-birthday-1' },
  { id: 'abstract-t-2', occasion: 'abstract', name: 'Cosmic Celebration', imageId: 'template-birthday-6' },
  { id: 'abstract-t-3', occasion: 'abstract', name: 'Modern Geometric', imageId: 'template-birthday-7' },
  { id: 'abstract-t-4', occasion: 'abstract', name: 'Art Deco Glam', imageId: 'template-birthday-20' },
  { id: 'abstract-t-5', occasion: 'abstract', name: 'Geometric Cheer', imageId: 'template-holiday-5' },
  { id: 'abstract-t-6', occasion: 'abstract', name: 'Watercolor Love', imageId: 'template-wedding-9' },
  { id: 'abstract-t-7', occasion: 'abstract', name: 'Art Deco Affair', imageId: 'template-wedding-10' },
  { id: 'abstract-t-8', occasion: 'abstract', name: 'Abstract Union', imageId: 'template-wedding-19' },

  // Birthday
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

  // Holiday
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

  // Wedding
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
  
  // Graduation
  { id: 'grad-t-1', occasion: 'graduation', name: 'The Tassel', imageId: 'template-graduation-1' },
  { id: 'grad-t-2', occasion: 'graduation', name: 'Future is Bright', imageId: 'template-graduation-2' },
  { id: 'grad-t-3', occasion: 'graduation', name: 'Class of 2024', imageId: 'template-graduation-3' },
  { id: 'grad-t-4', occasion: 'graduation', name: 'Adventure Awaits', imageId: 'template-graduation-4' },
  { id: 'grad-t-5', occasion: 'graduation', name: 'Scholarly Script', imageId: 'template-graduation-5' },

  // Lovers
  { id: 'love-t-1', occasion: 'lovers', name: 'Our Story', imageId: 'template-lovers-1' },
  { id: 'love-t-2', occasion: 'lovers', name: 'Better Together', imageId: 'template-lovers-2' },
  { id: 'love-t-3', occasion: 'lovers', name: 'XOXO', imageId: 'template-lovers-3' },
  { id: 'love-t-4', occasion: 'lovers', name: 'To My Love', imageId: 'template-lovers-4' },
  { id: 'love-t-5', occasion: 'lovers', name: 'Always & Forever', imageId: 'template-lovers-5' },
  
  // Group Card
  { id: 'group-t-1', occasion: 'group', name: 'Team Celebration', imageId: 'template-group-1' },
  { id: 'group-t-2', occasion: 'group', name: 'Thank You', imageId: 'template-group-2' },
  { id: 'group-t-3', occasion: 'group', name: 'Farewell', imageId: 'template-group-3' },
  { id: 'group-t-4', occasion: 'group', name: 'Good Luck', imageId: 'template-group-4' },
  { id: 'group-t-5', occasion: 'group', name: 'Congratulations', imageId: 'template-group-5' },
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
];

export type SuggestedMessage = {
  id: string;
  occasion: Occasion['id'];
  message: string;
};

export const suggestedMessages: SuggestedMessage[] = [
  // Birthday
  { id: 'bday-msg-1', occasion: 'birthday', message: 'Wishing you a day as special as you are. Happy Birthday!' },
  { id: 'bday-msg-2', occasion: 'birthday', message: 'May your birthday be filled with joy, laughter, and everything you wished for.' },
  { id: 'bday-msg-3', occasion: 'birthday', message: 'Another year older, another year wiser. Have a fantastic birthday!' },
  { id: 'bday-msg-4', occasion: 'birthday', message: 'Hope your special day brings you all that your heart desires! Happy Birthday.' },
  { id: 'bday-msg-5', occasion: 'birthday', message: 'Cheers to you for another trip around the sun. Happy Birthday!' },
  { id: 'bday-msg-6', occasion: 'birthday', message: 'Happy birthday! May your day be as wonderful as you are.' },
  { id: 'bday-msg-7', occasion: 'birthday', message: 'Wishing you a birthday that’s just as amazing as you are!' },
  { id: 'bday-msg-8', occasion: 'birthday', message: 'Enjoy your special day and may all your wishes come true.' },
  { id: 'bday-msg-9', occasion: 'birthday', message: 'Sending you smiles for every moment of your special day.' },
  { id: 'bday-msg-10', occasion: 'birthday', message: 'Happy birthday to one of my favorite people on the planet.' },

  // Holiday
  { id: 'holi-msg-1', occasion: 'holiday', message: 'Wishing you a season of joy and a new year of peace.' },
  { id: 'holi-msg-2', occasion: 'holiday', message: 'May the holiday season fill your home with joy, your heart with love, and your life with laughter.' },
  { id: 'holi-msg-3', occasion: 'holiday', message: 'Happy Holidays! Wishing you all the best this season and throughout the year.' },
  { id: 'holi-msg-4', occasion: 'holiday', message: 'May your holidays sparkle with moments of love, laughter, and goodwill.' },
  { id: 'holi-msg-5', occasion: 'holiday', message: 'Warmest wishes for a happy holiday season and a wonderful New Year.' },
  { id: 'holi-msg-6', occasion: 'holiday', message: 'Thinking of you with lots of love during this festive season.' },
  { id: 'holi-msg-7', occasion: 'holiday', message: 'May the peace and joy of the holidays be with you today and throughout the new year.' },
  { id: 'holi-msg-8', occasion: 'holiday', message: 'Wishing you a holiday season full of fun, and a new year filled with prosperity.' },
  { id: 'holi-msg-9', occasion: 'holiday', message: 'Let the spirit of the holidays warm your home and fill your heart.' },
  { id: 'holi-msg-10', occasion: 'holiday', message: 'Hope your holidays are filled with all your favorite things.' },
  
  // Wedding
  { id: 'wed-msg-1', occasion: 'wedding', message: 'Congratulations on finding your forever. Wishing you a lifetime of love and happiness.' },
  { id: 'wed-msg-2', occasion: 'wedding', message: 'May the years ahead be filled with lasting joy. Congratulations to a wonderful couple!' },
  { id: 'wed-msg-3', occasion: 'wedding', message: 'Your wedding day may come and go, but may your love forever grow. Congratulations!' },
  { id: 'wed-msg-4', occasion: 'wedding', message: 'Wishing you a beautiful wedding day and a future filled with happiness.' },
  { id: 'wed-msg-5', occasion: 'wedding', message: 'So happy to celebrate this special day with you both! Much love and happiness.' },
  { id: 'wed-msg-6', occasion: 'wedding', message: 'Congratulations on your marriage! Wishing you the best today and always.' },
  { id: 'wed-msg-7', occasion: 'wedding', message: 'May your joining together bring you more joy than you can imagine.' },
  { id: 'wed-msg-8', occasion: 'wedding', message: 'Here’s to a long and happy marriage! Congratulations!' },
  { id: 'wed-msg-9', occasion: 'wedding', message: 'Best wishes on this wonderful journey, as you build your new lives together.' },
  { id: 'wed-msg-10', occasion: 'wedding', message: 'Thank you for letting me share in your special day. I wish you all the happiness.' },
  
  // Graduation
  { id: 'grad-msg-1', occasion: 'graduation', message: 'Congratulations on your graduation! The future is all yours. Make it a great one.' },
  { id: 'grad-msg-2', occasion: 'graduation', message: 'Caps off to you, Graduate! Wishing you all the best for the future.' },
  { id: 'grad-msg-3', occasion: 'graduation', message: 'Congratulations on your well-deserved success. The journey is just beginning!' },
  { id: 'grad-msg-4', occasion: 'graduation', message: 'May your degree unlock many doors to a successful and happy life. Congratulations!' },
  { id: 'grad-msg-5', occasion: 'graduation', message: 'So proud of your hard work and dedication. Congratulations on your graduation!' },
  
  // Nature, Architecture, Abstract
  { id: 'nature-msg-1', occasion: 'nature', message: 'The beauty of nature is a gift that cultivates appreciation and gratitude.' },
  { id: 'nature-msg-2', occasion: 'nature', message: 'In every walk with nature, one receives far more than he seeks.' },
  { id: 'arch-msg-1', occasion: 'architecture', message: 'Great architecture is built on a foundation of creativity and precision.' },
  { id: 'arch-msg-2', occasion: 'architecture', message: 'The mother art is architecture. Without an architecture of our own we have no soul of our own civilization.' },
  { id: 'abstract-msg-1', occasion: 'abstract', message: 'Abstraction is the freedom of the mind. It’s a journey into the unknown.' },
  { id: 'abstract-msg-2', occasion: 'abstract', message: 'Art is not what you see, but what you make others see.' },
];
