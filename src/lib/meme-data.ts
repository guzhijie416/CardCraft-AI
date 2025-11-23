
export type MemeCategory = {
  id: 'protagonist' | 'situation' | 'problem' | 'solution';
  label: string;
  subCategories: MemeSubCategory[];
};

export type MemeSubCategory = {
  name: string;
  options: MemeOption[];
};

export type MemeOption = {
  id: string;
  text: string;
};

export const memeFactoryData: MemeCategory[] = [
  {
    id: 'protagonist',
    label: '1. The Protagonist',
    subCategories: [
      {
        name: 'Absurd Animals',
        options: [
          { id: 'p1', text: 'A Majestic Capybara' },
          { id: 'p2', text: 'A Caffeinated Squirrel' },
          { id: 'p3', text: 'A Philosophical Sloth' },
          { id: 'p4', text: 'A Grumpy Cat' },
          { id: 'p5', text: 'An Overly Dramatic Goose' },
        ],
      },
      {
        name: 'Historical Figures',
        options: [
          { id: 'p6', text: 'Albert Einstein' },
          { id: 'p7', text: 'Shakespeare' },
          { id: 'p8', text: 'Cleopatra' },
          { id: 'p9', text: 'A Stoic Roman Emperor' },
          { id: 'p10', text: 'A Victorian Ghost' },
        ],
      },
      {
        name: 'Mythical Creatures',
        options: [
          { id: 'p11', text: 'A world-weary Dragon' },
          { id: 'p12', text: 'A Unicorn Intern' },
          { id: 'p13', text: 'A Goblin with an old cellphone' },
          { id: 'p14', text: 'A Minotaur in a tiny car' },
        ],
      },
      {
        name: 'Everyday People',
        options: [
          { id: 'p15', text: 'A Tired Parent' },
          { id: 'p16', text: 'A Student During Finals Week' },
          { id: 'p17', text: 'An Office Worker on Monday Morning' },
          { id: 'p18', text: 'A Tourist with a huge backpack' },
        ],
      },
    ],
  },
  {
    id: 'situation',
    label: '2. The Situation',
    subCategories: [
      {
        name: 'Modern Jobs',
        options: [
          { id: 's1', text: '...working as a stressed-out Accountant.' },
          { id: 's2', text: '...trying to be a TikTok Influencer.' },
          { id: 's3', text: '...serving coffee as a hipster Barista.' },
          { id: 's4', text: '...attending a boring corporate meeting via Zoom.' },
          { id: 's5', text: '...working a customer service hotline.' },
        ],
      },
      {
        name: 'Everyday Scenarios',
        options: [
          { id: 's6', text: '...stuck in traffic.' },
          { id: 's7', text: '...trying to assemble IKEA furniture.' },
          { id: 's8', text: '...waiting for a pot of water to boil.' },
          { id: 's9', text: '...navigating a crowded supermarket.' },
          { id: 's10', text: '...attending a chaotic family dinner.' },
        ],
      },
      {
        name: 'Fantastical Settings',
        options: [
          { id: 's11', text: '...on a quest to find the perfect Wi-Fi signal.' },
          { id: 's12', text: '...ruling a kingdom made entirely of cheese.' },
          { id: 's13', text: '...piloting a giant mech suit.' },
          { id: 's14', text: '...competing in a magical baking show.' },
        ],
      },
    ],
  },
  {
    id: 'problem',
    label: '3. The Problem',
    subCategories: [
      {
        name: 'Modern Life Struggles',
        options: [
          { id: 'pr1', text: 'The Wi-Fi just went out.' },
          { id: 'pr2', text: 'Their social battery has completely drained.' },
          { id: 'pr3', text: 'They are paralyzed by too many choices on a streaming service.' },
          { id: 'pr4', text: 'They received an email that starts with "per my last email..."' },
          { id: 'pr5', text: 'They forgot their password for the 100th time.' },
        ],
      },
      {
        name: 'Social Dilemmas',
        options: [
          { id: 'pr6', text: "They can't agree on what to have for dinner." },
          { id: 'pr7', text: 'They have been left on "read."' },
          { id: 'pr8', text: 'They have to make small talk at a party where they know no one.' },
          { id: 'pr9', text: 'They accidentally "liked" an old photo while snooping on social media.' },
        ],
      },
      {
        name: 'Absurd Challenges',
        options: [
          { id: 'pr10', text: 'Their nemesis is a particularly loud goose.' },
          { id: 'pr11', text: 'The floor has inexplicably turned into lava.' },
          { id: 'pr12', text: 'They are being haunted by the ghost of a 1990s pop-up ad.' },
          { id: 'pr13', text: 'They have lost the one sock that completes the pair.' },
        ],
      },
    ],
  },
  {
    id: 'solution',
    label: '4. The (Weird) Solution',
    subCategories: [
      {
        name: 'Passive-Aggressive Actions',
        options: [
          { id: 'sol1', text: '...so they decide to just take a nap instead.' },
          { id: 'sol2', text: '...so they respond with a single, cryptic emoji.' },
          { id: 'sol3', text: '...so they start watering their houseplants with intense focus.' },
          { id: 'sol4', text: '...so they just stare blankly into the middle distance.' },
        ],
      },
      {
        name: 'Overly Dramatic Reactions',
        options: [
          { id: 'sol5', text: '...so they declare their villain origin story has begun.' },
          { id: 'sol6', text: '...so they start monologuing like a Shakespearean actor.' },
          { id: 'sol7', text: '...so they build an elaborate pillow fort to hide from their responsibilities.' },
          { id: 'sol8', text: '...so they decide to run away and join the circus.' },
        ],
      },
      {
        name: 'Bizarre Coping Mechanisms',
        options: [
          { id: 'sol9', text: '...so they consult a magic 8-ball for all future life decisions.' },
          { id: 'sol10', text: '...so they start communicating exclusively through interpretive dance.' },
          { id: 'sol11', text: '...so they decide to solve the problem by making a very elaborate sandwich.' },
          { id: 'sol12', text: '...so they simply ascend to a higher plane of existence.' },
        ],
      },
    ],
  },
];


export type StyleOption = {
  id: string;
  name: string;
  description: string;
  keywords: string;
};

export const characterStyles: StyleOption[] = [
    { id: 'cs-1', name: 'Photorealistic', description: 'As real as a photograph. Perfect for absurd, uncanny valley humor.', keywords: 'photorealistic, hyper-detailed, cinematic photo' },
    { id: 'cs-2', name: '3D Animated Character', description: 'The polished, friendly look of a modern animated movie.', keywords: '3D animated character, Pixar style, rendered in Blender, smooth textures' },
    { id: 'cs-3', name: 'Classic Cartoon', description: 'A fun, 2D cartoon with bold outlines and flat colors.', keywords: 'classic cartoon style, 2D animation, bold outlines, Looney Tunes style' },
    { id: 'cs-4', name: 'Simple Line Art', description: 'A clean, black and white outline, like a page from a coloring book. Minimalist and graphic.', keywords: 'simple line art, coloring book page, black and white, clean outlines, minimalist icon' },
    { id: 'cs-5', name: 'Vintage Rubber Hose', description: 'The classic, bendy-limbed animation style of the 1930s (think early Mickey Mouse or Cuphead).', keywords: 'vintage 1930s rubber hose cartoon style, pie-eyed, black and white animation' },
    { id: 'cs-6', name: 'Claymation Figure', description: 'The charming, handmade look of a character sculpted from clay.', keywords: 'claymation style, stop-motion animation, plasticine figure, sculpted from clay' },
];

export const sceneStyles: StyleOption[] = [
    { id: 'ss-1', name: 'Full Color Photo', description: 'The default, realistic look. The world looks as real as the character.', keywords: '' },
    { id: 'ss-2', name: 'Dramatic Black & White', description: 'A high-contrast, black and white world, like a classic film noir.', keywords: 'black and white photograph, film noir, high contrast, monochrome' },
    { id: 'ss-3', name: 'Vibrant Watercolor', description: 'The entire scene is rendered as a beautiful, expressive watercolor.', keywords: 'vibrant watercolor painting, soft bleeding edges, painted on textured paper' },
    { id: 'ss-4', name: 'Cozy Colored Pencil', description: 'The whole world has the soft, warm, and textured look of a colored pencil drawing.', keywords: 'colored pencil sketch, soft blending, layered colors, hand-drawn aesthetic' },
    { id: 'ss-5', name: 'Gritty Graphic Novel', description: 'A high-contrast, inked look with dramatic shadows, like a page from a comic book.', keywords: 'graphic novel illustration, comic book style, inked, heavy shadows, Ben Day dots' },
    { id: 'ss-6', name: 'Faded Vintage Photo', description: 'The nostalgic, sepia-toned or faded color look of an old photograph from the 1960s or 70s.', keywords: 'faded vintage photograph, sepia tone, retro, grainy film, circa 1970' },
];

export const outputFormats: StyleOption[] = [
    { id: 'of-1', name: 'Standard Image', description: 'The clean, borderless image. Perfect for general-purpose sharing.', keywords: '' },
    { id: 'of-2', name: 'Classic Meme', description: 'Adds space at the top and/or bottom for the iconic bold meme text.', keywords: 'meme format, space for text at top' },
    { id: 'of-3', name: 'Postcard', description: 'Places the image within a classic postcard frame, complete with a stamp area and a "Greetings From..." feel.', keywords: 'vintage postcard frame, stamp, border' },
    { id: 'of-4', name: 'Playing Card (扑克牌)', description: 'Formats the image as a playing card, with a decorative border and a corner symbol (e.g., King of Spades - K♠).', keywords: 'playing card design, King of Spades, decorative border, ornate, card face' },
    { id: 'of-5', name: 'Tarot Card (塔罗牌)', description: 'An elegant and mystical format. Places the image within an ornate Tarot card frame, with a title at the bottom (e.g., "X - The Wheel of Fortune").', keywords: 'Tarot card design, The Fool, mystical, ornate border, intricate, Rider-Waite style' },
    { id: 'of-6', name: 'Movie Poster', description: 'Adds a cinematic border, space for a title, and "coming soon" text, making the scene look like an ad for a blockbuster film.', keywords: 'movie poster format, cinematic border, title text, credit block' },
];

    