
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
import { Loader2, Sparkles, Wand2, Lightbulb, Download, Share2, Printer, MessageSquareQuote, Settings, ChevronDown, XCircle, AspectRatio, Clapperboard, Film, Wind, Sunrise } from 'lucide-react';
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
type AnimationState = 'idle' | 'generating' | 'done' | 'error';

// New type for composition state
type CompositionState = {
  framing?: string;
  balance?: string;
  pattern?: string;
  cinematic?: string;
};


const refinementOptions = {
  artisticMedium: [
    { id: 'am-1', value: 'watercolor painting', label: 'Watercolor' },
    { id: 'am-2', value: 'oil painting', label: 'Oil Painting' },
    { id: 'am-3', value: 'charcoal sketch', label: 'Charcoal Sketch' },
    { id: 'am-4', value: 'vintage postcard', label: 'Vintage Postcard' },
  ],
  colorPalette: [
    { id: 'cp-1', value: 'a soft pastel color palette', label: 'Soft Pastels' },
    { id: 'cp-2', value: 'vibrant and bold colors', label: 'Vibrant & Bold' },
    { id: 'cp-3', value: 'a warm and earthy palette', label: 'Warm & Earthy' },
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
        category: 'Dynamic & Cinematic (Premium)',
        description: 'Advanced options that create a sense of movement and story.',
        isPremium: true,
        options: [
            { id: 'co-13', label: 'Leading Lines', description: 'Uses lines within the image (a road, a river, a fence) to create a path that guides the viewer\'s eye directly to your main subject.', value: 'leading lines, strong diagonal lines, guides the eye, vanishing point, dynamic composition, one-point perspective' },
            { id: 'co-14', label: 'Dynamic Angle (Dutch Angle)', description: 'Tilts the "camera" for a dramatic, unsettling, or energetic feeling. Perfect for action, excitement, and high-impact scenes.', value: 'dutch angle, tilted frame, canted angle, dynamic, off-kilter, action shot' },
            { id: 'co-15', label: 'Golden Spiral', description: 'An advanced composition based on a natural spiral (the golden ratio). Creates a perfectly balanced and organic flow that is naturally beautiful to the human eye.', value: 'golden ratio, Fibonacci spiral, perfect composition, organic flow, dynamic symmetry, divine proportion' },
        ]
    }
  ],
  lighting: [
    { id: 'li-1', value: 'soft diffused lighting', label: 'Soft & Diffused' },
    { id: 'li-2', value: 'dramatic, high-contrast lighting', label: 'High-Contrast' },
    { id: 'li-3', value: 'golden hour glow', label: 'Golden Hour' },
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
  const [artisticMedium, setArtisticMedium] = useState<string | undefined>();
  const [colorPalette, setColorPalette] = useState<string | undefined>();
  const [composition, setComposition] = useState<CompositionState>({});
  const [lighting, setLighting] = useState<string | undefined>();
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

  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [animationPrompt, setAnimationPrompt] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

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
        const fullCompositionPrompt = Object.values(composition).filter(Boolean).join(', ');

        const result = await generateRefinedPromptAction({
            basePrompt: form.getValues('personalizedPrompt'),
            artisticMedium,
            colorPalette,
            composition: fullCompositionPrompt,
            lighting,
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
    setAnimationState('idle');
    setAnalysis(null);
    setRefinedPrompt(null);
    setFinalCardUri(null);
    setGeneratedVideoUrl(null);
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

  if (editorState === 'done' && finalCardUri) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Your Card is Ready!</CardTitle>
          <CardDescription>Download your creation or add a personal message.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full rounded-lg overflow-hidden border relative bg-muted" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
            {animationState === 'done' && generatedVideoUrl ? (
                <video src={generatedVideoUrl} className="w-full h-full object-contain" autoPlay loop muted playsInline />
            ) : (
                <Image src={finalCardUri} alt="Generated AI card" fill className="object-contain" />
            )}

            {personalMessage && animationState !== 'done' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 flex items-end justify-center p-8">
                    <p className="text-white text-center text-xl font-body">{personalMessage}</p>
                </div>
            )}
            
            {animationState === 'generating' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <p className="mt-4">Animating your card...</p>
                    <p className="text-sm text-white/80">(This can take up to a minute)</p>
                </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a href={animationState === 'done' && generatedVideoUrl ? generatedVideoUrl : finalCardUri} download={animationState === 'done' ? "cardcraft-animation.mp4" : "cardcraft-creation.png"}>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" /> 
                {animationState === 'done' ? 'Download Video' : 'Download Image'}
                </Button>
            </a>
            <Button variant="secondary" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share Card</Button>
            <Button variant="secondary"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
          
           {/* Animation Section */}
          <Collapsible className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="h-5 w-5 text-primary"/>
                    <span className="font-semibold">Animate It (Beta)</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">This feature is temporarily disabled while we make improvements.</p>
              </CollapsibleContent>
          </Collapsible>
          
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
    const isComposition = categoryKey === 'composition';
    const isOpen = openSections[categoryKey];
    const onOpenChange = (open: boolean) => setOpenSections(prev => ({ ...prev, [categoryKey]: open }));


    return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
            <span className="font-semibold">{title}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
              {isComposition ? (
                options.map(category => (
                  <div key={category.category} className="mt-4 first:mt-0">
                    <div className='flex items-center gap-2'>
                        <h4 className="font-semibold text-sm mb-1">{category.category}</h4>
                        {category.isPremium && <Badge variant="outline" className="text-primary border-primary">Premium</Badge>}
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
                {options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.id} />
                        <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                ))}
                </RadioGroup>
              )}
            {
              !isComposition && value && <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => onValueChange(undefined)}><XCircle className="mr-1 h-4 w-4" />Clear</Button>
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
                     <Button type="button" onClick={onGenerateRefinedPrompt} className="w-full" disabled={isRefining || !form.getValues('personalizedPrompt')}>
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
