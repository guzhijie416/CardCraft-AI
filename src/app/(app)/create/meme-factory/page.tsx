
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateMemePromptAction, generateCardAction } from '@/app/actions';
import { memeFactoryData, MemeOption, characterStyles, sceneStyles, outputFormats, StyleOption, playingCardRanks, playingCardSuits, majorArcana, courtCardRanks } from '@/lib/meme-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Repeat, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';


type PageStep = 'story' | 'stylize' | 'result';
type GenerationState = 'idle' | 'generating_prompt' | 'generating_image' | 'done' | 'error';

const storySchema = z.object({
  protagonist: z.string({ required_error: 'Please choose a protagonist.' }),
  situation: z.string({ required_error: 'Please choose a situation.' }),
  problem: z.string({ required_error: 'Please choose a problem.' }),
  solution: z.string({ required_error: 'Please choose a solution.' }),
});

const styleSchema = z.object({
    characterStyle: z.string({ required_error: 'Please choose a character style.' }),
    sceneStyle: z.string({ required_error: 'Please choose a scene style.' }),
    outputFormat: z.string({ required_error: 'Please choose an output format.' }),
    tarotCard: z.string().optional(),
    tarotTransparentBg: z.boolean().optional(),
    playingCardSuit: z.string().optional(),
    playingCardRank: z.string().optional(),
    playingCardRegalBg: z.boolean().optional(),
});

type StoryFormValues = z.infer<typeof storySchema>;
type StyleFormValues = z.infer<typeof styleSchema>;

export default function MemeFactoryPage() {
  const [pageStep, setPageStep] = useState<PageStep>('story');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  const storyForm = useForm<StoryFormValues>({ resolver: zodResolver(storySchema) });
  const styleForm = useForm<StyleFormValues>({ resolver: zodResolver(styleSchema), defaultValues: {
    characterStyle: characterStyles[0].id,
    sceneStyle: sceneStyles[0].id,
    outputFormat: outputFormats[0].id,
    playingCardRank: playingCardRanks[0],
    playingCardSuit: playingCardSuits[0].id,
    tarotCard: majorArcana[0].keywords,
  } });
  
  const findSelectedOption = (data: MemeOption[], selectedId: string): MemeOption | undefined => {
      return data.find(opt => opt.id === selectedId);
  }

  const findSelectedStyle = (data: StyleOption[], selectedId: string): StyleOption | undefined => {
    return data.find(opt => opt.id === selectedId);
  }
  
  const allMemeOptions = memeFactoryData.flatMap(c => c.subCategories.flatMap(sc => sc.options));
  const watchedStory = storyForm.watch();
  const watchedOutputFormat = styleForm.watch('outputFormat');
  const watchedPlayingCardRank = styleForm.watch('playingCardRank');

  useEffect(() => {
    if (courtCardRanks.includes(watchedPlayingCardRank || '')) {
      styleForm.setValue('playingCardRegalBg', true);
    }
  }, [watchedPlayingCardRank, styleForm]);

  const onStorySubmit = (data: StoryFormValues) => {
    setPageStep('stylize');
  };

  const onStyleSubmit = async (styleData: StyleFormValues) => {
    setPageStep('result');
    setGenerationState('generating_prompt');
    setErrorMessage(null);
    setGeneratedImageUri(null);
    setGeneratedPrompt(null);
    
    const storyData = storyForm.getValues();

    try {
        const promptInput = {
            protagonist: findSelectedOption(allMemeOptions, storyData.protagonist)?.text || '',
            situation: findSelectedOption(allMemeOptions, storyData.situation)?.text || '',
            problem: findSelectedOption(allMemeOptions, storyData.problem)?.text || '',
            solution: findSelectedOption(allMemeOptions, storyData.solution)?.text || '',
            characterStyle: findSelectedStyle(characterStyles, styleData.characterStyle)?.keywords || '',
            sceneStyle: findSelectedStyle(sceneStyles, styleData.sceneStyle)?.keywords || '',
            outputFormat: findSelectedStyle(outputFormats, styleData.outputFormat)?.keywords || '',
            tarotCard: styleData.outputFormat === 'of-5' ? styleData.tarotCard : undefined,
            tarotTransparentBg: styleData.outputFormat === 'of-5' ? styleData.tarotTransparentBg : undefined,
            playingCardRank: styleData.outputFormat === 'of-4' ? styleData.playingCardRank : undefined,
            playingCardSuit: styleData.outputFormat === 'of-4' ? findSelectedStyle(playingCardSuits, styleData.playingCardSuit || '')?.symbol : undefined,
            playingCardRegalBg: styleData.outputFormat === 'of-4' ? styleData.playingCardRegalBg : undefined,
        }

      const promptResult = await generateMemePromptAction(promptInput);

      if (!promptResult || !promptResult.memePrompt) {
        throw new Error("The AI failed to generate a meme prompt. Please try again.");
      }
      
      setGeneratedPrompt(promptResult.memePrompt);
      setGenerationState('generating_image');
      
      const imageResult = await generateCardAction({
          masterPrompt: "A funny meme, digital art.",
          personalizedPrompt: promptResult.memePrompt,
          aspectRatio: '1:1',
      });

      if (!imageResult || !imageResult.cardDataUri) {
          throw new Error("The AI failed to generate an image. Please try again.");
      }

      setGeneratedImageUri(imageResult.cardDataUri);
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
    styleForm.reset({
        characterStyle: characterStyles[0].id,
        sceneStyle: sceneStyles[0].id,
        outputFormat: outputFormats[0].id,
        playingCardRank: playingCardRanks[0],
        playingCardSuit: playingCardSuits[0].id,
        tarotCard: majorArcana[0].keywords,
    });
    setPageStep('story');
    setGeneratedImageUri(null);
    setGeneratedPrompt(null);
    setErrorMessage(null);
    setGenerationState('idle');
  }

  const isLoading = generationState === 'generating_prompt' || generationState === 'generating_image';

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">The Meme Factory</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your Inside Jokes, Instantly Illustrated.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
            {pageStep === 'story' && (
                 <FormProvider {...storyForm}>
                    <form onSubmit={storyForm.handleSubmit(onStorySubmit)}>
                        <Card>
                            <CardHeader>
                            <CardTitle>Act I: Build Your Story</CardTitle>
                            <CardDescription>Follow the four steps to build your hilarious scenario.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            {memeFactoryData.map((category) => (
                                <FormField
                                key={category.id}
                                control={storyForm.control}
                                name={category.id}
                                render={({ field }) => (
                                    <FormItem>
                                        <Card className="p-4">
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
                                        </Card>
                                    </FormItem>
                                )}
                                />
                            ))}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" size="lg">
                                    Next: Stylize Your Scene <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </FormProvider>
            )}

            {pageStep === 'stylize' && (
                 <FormProvider {...styleForm}>
                    <form onSubmit={styleForm.handleSubmit(onStyleSubmit)}>
                        <Card>
                             <CardHeader>
                                <Button type="button" variant="ghost" onClick={() => setPageStep('story')} className="self-start -ml-4">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Story
                                </Button>
                                <CardTitle>Act II & III: Stylize Your Scene</CardTitle>
                                <CardDescription>Now, choose the look, feel, and format of your meme.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <StyleSection fieldName="characterStyle" title="🎨 Act 1: Define Your Character's Look" options={characterStyles} />
                                <StyleSection fieldName="sceneStyle" title="🎬 Act 2: Set the Scene's Atmosphere" options={sceneStyles} />
                                <StyleSection fieldName="outputFormat" title="🖼️ Act 3: Choose Your Final Format" options={outputFormats} isFormatSection={true} watchedOutputFormat={watchedOutputFormat} watchedPlayingCardRank={watchedPlayingCardRank} />
                            </CardContent>
                             <CardFooter>
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate Meme
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </FormProvider>
            )}

            {pageStep === 'result' && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Masterpiece</CardTitle>
                        <CardDescription>Your viral masterpiece is ready!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Card className="relative flex items-center justify-center bg-muted/50 border-dashed aspect-square">
                            {isLoading && (
                                <div className="text-center text-muted-foreground p-4">
                                    <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                                    <p>{generationState === 'generating_prompt' ? 'Generating the perfect prompt...' : 'Bringing your meme to life...'}</p>
                                </div>
                            )}
                            {generationState === 'done' && generatedImageUri && (
                                <Image src={generatedImageUri} alt="Generated meme" fill className="object-contain rounded-md" />
                            )}
                            {generationState === 'error' && (
                                <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
                            )}
                        </Card>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button onClick={handleStartOver} variant="outline">
                            <Repeat className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                        <a href={generatedImageUri || ''} download="cardcraft-meme.png">
                            <Button className="w-full" disabled={!generatedImageUri}>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </a>
                    </CardFooter>
                </Card>
            )}

        </div>
        
        <div className="space-y-6 sticky top-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Meme Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="w-28 justify-center">Protagonist</Badge>
                        <span className="text-muted-foreground">{findSelectedOption(allMemeOptions, watchedStory.protagonist)?.text || '...'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="w-28 justify-center">Situation</Badge>
                        <span className="text-muted-foreground">{findSelectedOption(allMemeOptions, watchedStory.situation)?.text || '...'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="w-28 justify-center">Problem</Badge>
                        <span className="text-muted-foreground">{findSelectedOption(allMemeOptions, watchedStory.problem)?.text || '...'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="w-28 justify-center">Solution</Badge>
                        <span className="text-muted-foreground">{findSelectedOption(allMemeOptions, watchedStory.solution)?.text || '...'}</span>
                    </div>
                    {generatedPrompt && (
                        <>
                         <Separator className="my-4"/>
                         <p className="text-xs font-mono bg-muted p-2 rounded-md">{generatedPrompt}</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}


function StyleSection({ fieldName, title, options, isFormatSection = false, watchedOutputFormat, watchedPlayingCardRank }: { fieldName: any, title: string, options: StyleOption[], isFormatSection?: boolean, watchedOutputFormat?: string, watchedPlayingCardRank?: string }) {
    const { control, setValue } = useFormContext();
    
    return (
        <Card className="p-4">
            <FormLabel className="text-lg font-bold font-headline">{title}</FormLabel>
             <Controller
                name={fieldName}
                control={control}
                render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-4 space-y-2">
                        {options.map((option) => (
                            <div key={option.id}>
                                <FormItem className={cn("flex items-start space-x-3 space-y-0 p-3 rounded-lg border transition-colors",
                                    field.value === option.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                )}>
                                    <FormControl>
                                        <RadioGroupItem value={option.id} className="mt-1" />
                                    </FormControl>
                                    <div className="grid gap-1.5">
                                        <FormLabel className="font-semibold">{option.name}</FormLabel>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                </FormItem>
                                {isFormatSection && field.value === option.id && option.id === 'of-4' && ( // Playing Card
                                    <Card className="mt-2 p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={control} name="playingCardRank" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Rank</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Rank" /></SelectTrigger></FormControl>
                                                        <SelectContent>{playingCardRanks.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={control} name="playingCardSuit" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Suit</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Suit" /></SelectTrigger></FormControl>
                                                        <SelectContent>{playingCardSuits.map(s => <SelectItem key={s.id} value={s.id}>{s.symbol} {s.name}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={control} name="playingCardRegalBg" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Add Regal Background</FormLabel>
                                                    <FormDescription>For J, Q, K cards</FormDescription>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={courtCardRanks.includes(watchedPlayingCardRank || '')} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </Card>
                                )}
                                {isFormatSection && field.value === option.id && option.id === 'of-5' && ( // Tarot Card
                                     <Card className="mt-2 p-4 space-y-4">
                                        <FormField control={control} name="tarotCard" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Major Arcana</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Card" /></SelectTrigger></FormControl>
                                                    <SelectContent>{majorArcana.map(c => <SelectItem key={c.id} value={c.keywords}>{c.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <FormDescription>{majorArcana.find(c => c.keywords === field.value)?.description}</FormDescription>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="tarotTransparentBg" render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Transparent Background</FormLabel>
                                                    <FormDescription>Generate as a PNG for overlays</FormDescription>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                     </Card>
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
            <FormMessage className="mt-2" />
        </Card>
    );
}

    