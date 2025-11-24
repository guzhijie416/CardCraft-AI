'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateMemePromptAction, generateCardAction } from '@/app/actions';
import { memeFactoryData, MemeOption, characterStyles, sceneStyles, outputFormats, majorArcana, playingCardRanks, playingCardSuits, courtCardRanks } from '@/lib/meme-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { GenerateMemePromptInput } from '@/ai/flows/generate-meme-prompt';

type GenerationState = 'idle' | 'generating_prompt' | 'generating_image' | 'done' | 'error';
type FormStep = 'story' | 'stylize' | 'result';

const storyFormSchema = z.object({
  protagonist: z.string({ required_error: 'Please choose a protagonist.' }),
  situation: z.string({ required_error: 'Please choose a situation.' }),
  problem: z.string({ required_error: 'Please choose a problem.' }),
  solution: z.string({ required_error: 'Please choose a solution.' }),
});

const styleFormSchema = z.object({
    characterStyle: z.string({ required_error: 'Please choose a character style.' }),
    sceneStyle: z.string({ required_error: 'Please choose a scene style.' }),
    outputFormat: z.string({ required_error: 'Please choose an output format.' }),
    // Advanced format options
    tarotCard: z.string().optional(),
    tarotTransparentBg: z.boolean().optional(),
    playingCardSuit: z.string().optional(),
    playingCardRank: z.string().optional(),
    playingCardRegalBg: z.boolean().optional(),
});


type StoryFormValues = z.infer<typeof storyFormSchema>;
type StyleFormValues = z.infer<typeof styleFormSchema>;

export default function MemeFactoryPage() {
  const [formStep, setFormStep] = useState<FormStep>('story');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedCardUri, setGeneratedCardUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  const { toast } = useToast();

  const storyForm = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
  });
  
  const styleForm = useForm<StyleFormValues>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: {
        characterStyle: '3D animated character',
        sceneStyle: '',
        outputFormat: '',
        tarotTransparentBg: false,
        playingCardRegalBg: false,
    }
  });
  
  // Watch for changes that affect UI logic
  const selectedOutputFormat = styleForm.watch('outputFormat');
  const selectedPlayingCardRank = styleForm.watch('playingCardRank');

  // Automatically toggle the regal background for court cards
  const isCourtCard = courtCardRanks.includes(selectedPlayingCardRank || '');
  if (isCourtCard && !styleForm.getValues('playingCardRegalBg')) {
      styleForm.setValue('playingCardRegalBg', true);
  }


  const handleStorySubmit = (data: StoryFormValues) => {
    setFormStep('stylize');
  };

  const handleStyleSubmit = async (styleData: StyleFormValues) => {
    setFormStep('result');
    setGenerationState('generating_prompt');
    setErrorMessage(null);
    setGeneratedCardUri(null);

    const storyData = storyForm.getValues();

    const findSelectedOptionText = (categoryKey: keyof StoryFormValues, selectedId: string): string => {
        const category = memeFactoryData.find(c => c.id === categoryKey);
        if (!category) return '';
        const allOptions = category.subCategories.flatMap(sc => sc.options);
        return allOptions.find(opt => opt.id === selectedId)?.text || '';
    }

    try {
      const promptInput: GenerateMemePromptInput = {
        protagonist: findSelectedOptionText('protagonist', storyData.protagonist),
        situation: findSelectedOptionText('situation', storyData.situation),
        problem: findSelectedOptionText('problem', storyData.problem),
        solution: findSelectedOptionText('solution', storyData.solution),
        characterStyle: styleData.characterStyle,
        sceneStyle: styleData.sceneStyle,
        outputFormat: styleData.outputFormat,
        tarotCard: styleData.tarotCard,
        tarotTransparentBg: styleData.tarotTransparentBg,
        playingCardSuit: styleData.playingCardSuit,
        playingCardRank: styleData.playingCardRank,
        playingCardRegalBg: styleData.playingCardRegalBg,
      };

      const promptResult = await generateMemePromptAction(promptInput);

      if (!promptResult || !promptResult.memePrompt) {
        throw new Error("The AI failed to generate a meme prompt. Please try again.");
      }
      
      setGeneratedPrompt(promptResult.memePrompt);
      setGenerationState('generating_image');
      
      const imageResult = await generateCardAction({
          masterPrompt: "A funny meme, digital art.",
          personalizedPrompt: promptResult.memePrompt,
      });

      if (!imageResult || !imageResult.cardDataUri) {
          throw new Error("The AI failed to generate an image. Please try again.");
      }

      setGeneratedCardUri(imageResult.cardDataUri);
      setGenerationState('done');
      toast({
        title: 'Meme Generated!',
        description: 'Your viral masterpiece is ready.',
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
  
  const handleStartOver = () => {
    storyForm.reset();
    styleForm.reset();
    setGeneratedCardUri(null);
    setGeneratedPrompt(null);
    setErrorMessage(null);
    setGenerationState('idle');
    setFormStep('story');
  }

  const isLoading = generationState === 'generating_prompt' || generationState === 'generating_image';
  
  if (formStep === 'result') {
     return (
        <div className="container mx-auto py-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Your Masterpiece</CardTitle>
                    <CardDescription>
                        {isLoading ? 'Your viral masterpiece is being generated...' : 'Your viral masterpiece is ready!'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Card className="relative flex items-center justify-center bg-muted/50 border-dashed aspect-square">
                        {isLoading && (
                            <div className="text-center text-muted-foreground p-4">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                                <p>{generationState === 'generating_prompt' ? 'Generating the perfect prompt...' : 'Bringing your meme to life...'}</p>
                            </div>
                        )}
                        {generationState === 'done' && generatedCardUri && (
                            <Image src={generatedCardUri} alt="Generated meme" fill className="object-contain rounded-md" />
                        )}
                        {generationState === 'error' && (
                            <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
                        )}
                    </Card>
                    {generatedPrompt && (
                        <div className="mt-4">
                            <p className="text-xs font-mono bg-muted p-2 rounded-md">{generatedPrompt}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                    <Button onClick={handleStartOver} variant="outline">
                        <Repeat className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                    <a href={generatedCardUri || ''} download="cardcraft-meme.png">
                        <Button className="w-full" disabled={!generatedCardUri}>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                    </a>
                </CardFooter>
            </Card>
        </div>
     )
  }

  return (
    <div className="container mx-auto py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">The Meme Factory</h1>
            <p className="text-muted-foreground mt-2 text-lg">Your Inside Jokes, Instantly Illustrated.</p>
        </div>

        {formStep === 'story' && (
          <FormProvider {...storyForm}>
            <form onSubmit={storyForm.handleSubmit(handleStorySubmit)} className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                    <CardTitle>Build Your Story</CardTitle>
                    <CardDescription>Follow the four steps to build your hilarious scenario.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                    {memeFactoryData.map((category) => (
                        <FormField
                        key={category.id}
                        control={storyForm.control}
                        name={category.id}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg font-bold font-headline">{category.label}</FormLabel>
                                <FormControl className="mt-4">
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-4">
                                    {category.subCategories.map((sub) => (
                                        <div key={sub.name} className="space-y-2">
                                            <h4 className="font-semibold">{sub.name}</h4>
                                            {sub.options.map((option) => (
                                            <FormItem key={option.id} className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50">
                                                <FormControl>
                                                <RadioGroupItem value={option.id} />
                                                </FormControl>
                                                <FormLabel className="font-normal w-full">{option.text}</FormLabel>
                                            </FormItem>
                                            ))}
                                        </div>
                                    ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage className="mt-2" />
                            </FormItem>
                        )}
                        />
                    ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">
                            Next: Stylize Your Scene &rarr;
                        </Button>
                    </CardFooter>
                </Card>
            </form>
          </FormProvider>
        )}

        {formStep === 'stylize' && (
            <FormProvider {...styleForm}>
                 <form onSubmit={styleForm.handleSubmit(handleStyleSubmit)} className="max-w-2xl mx-auto">
                    <Card>
                         <CardHeader>
                            <CardTitle>Stylize Your Scene</CardTitle>
                            <CardDescription>Choose the look, feel, and format of your masterpiece.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Character Style */}
                            <FormField
                                control={styleForm.control}
                                name="characterStyle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg font-bold font-headline">🎨 Act 1: Define Your Character's Look</FormLabel>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {characterStyles.map(style => (
                                                <Card key={style.id} className={cn("has-[:checked]:border-primary", field.value === style.keywords && "border-primary")}>
                                                    <RadioGroupItem value={style.keywords} id={style.id} className="sr-only" />
                                                    <Label htmlFor={style.id} className="cursor-pointer block p-4">
                                                        <p className="font-semibold">{style.name}</p>
                                                        <p className="text-sm text-muted-foreground">{style.description}</p>
                                                    </Label>
                                                </Card>
                                            ))}
                                        </RadioGroup>
                                    </FormItem>
                                )}
                            />

                            {/* Scene Style */}
                            <FormField
                                control={styleForm.control}
                                name="sceneStyle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg font-bold font-headline">🎬 Act 2: Set the Scene's Atmosphere</FormLabel>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {sceneStyles.map(style => (
                                                <Card key={style.id} className={cn("has-[:checked]:border-primary", field.value === style.keywords && "border-primary")}>
                                                    <RadioGroupItem value={style.keywords} id={style.id} className="sr-only" />
                                                    <Label htmlFor={style.id} className="cursor-pointer block p-4">
                                                        <p className="font-semibold">{style.name}</p>
                                                        <p className="text-sm text-muted-foreground">{style.description}</p>
                                                    </Label>
                                                </Card>
                                            ))}
                                        </RadioGroup>
                                    </FormItem>
                                )}
                            />

                            {/* Output Format */}
                             <FormField
                                control={styleForm.control}
                                name="outputFormat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg font-bold font-headline">🖼️ Act 3: Choose Your Final Format</FormLabel>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {outputFormats.map(style => (
                                                <Card key={style.id} className={cn("has-[:checked]:border-primary", field.value === style.keywords && "border-primary")}>
                                                     <RadioGroupItem value={style.keywords} id={style.id} className="sr-only" />
                                                    <Label htmlFor={style.id} className="cursor-pointer block p-4">
                                                        <p className="font-semibold">{style.name}</p>
                                                        <p className="text-sm text-muted-foreground">{style.description}</p>
                                                    </Label>
                                                </Card>
                                            ))}
                                        </RadioGroup>
                                    </FormItem>
                                )}
                            />
                            
                            {/* ADVANCED FORMAT OPTIONS */}
                            <div className="space-y-4">
                                {selectedOutputFormat === 'Tarot card design' && (
                                     <Card className="p-4 bg-muted/50">
                                         <FormField
                                            control={styleForm.control}
                                            name="tarotCard"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Major Arcana</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a Tarot card..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {majorArcana.map(card => (
                                                                <SelectItem key={card.id} value={card.keywords}>{card.name}: <span className='text-muted-foreground ml-2'>{card.description}</span></SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={styleForm.control}
                                            name="tarotTransparentBg"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Transparent Background</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                     </Card>
                                )}

                                {selectedOutputFormat === 'playing card design' && (
                                    <Card className="p-4 bg-muted/50 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={styleForm.control}
                                                name="playingCardSuit"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Suit</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Suit..." /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {playingCardSuits.map(suit => <SelectItem key={suit.id} value={suit.symbol}>{suit.symbol} {suit.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={styleForm.control}
                                                name="playingCardRank"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rank</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Rank..." /></SelectTrigger></FormControl>
                                                            <SelectContent>{playingCardRanks.map(rank => <SelectItem key={rank} value={rank}>{rank}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                         <FormField
                                            control={styleForm.control}
                                            name="playingCardRegalBg"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Add Regal Background</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isCourtCard} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" size="lg">
                                <Wand2 className="mr-2 h-4 w-4" /> Generate Meme
                            </Button>
                            <Button variant="ghost" onClick={() => setFormStep('story')}>&larr; Back to Story</Button>
                        </CardFooter>
                    </Card>
                 </form>
            </FormProvider>
        )}
    </div>
  );
}