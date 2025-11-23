
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateMemePromptAction, generateCardAction } from '@/app/actions';
import { memeFactoryData, MemeOption, characterStyles, sceneStyles, outputFormats, StyleOption } from '@/lib/meme-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Repeat, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


type PageStep = 'story' | 'stylize' | 'result';
type GenerationState = 'idle' | 'generating_prompt' | 'generating_image' | 'error';

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
  const styleForm = useForm<StyleFormValues>({ resolver: zodResolver(styleSchema) });
  
  const findSelectedOption = (data: MemeOption[], selectedId: string): MemeOption | undefined => {
      return data.find(opt => opt.id === selectedId);
  }

  const findSelectedStyle = (data: StyleOption[], selectedId: string): StyleOption | undefined => {
    return data.find(opt => opt.id === selectedId);
  }
  
  const allMemeOptions = memeFactoryData.flatMap(c => c.subCategories.flatMap(sc => sc.options));
  const watchedStory = storyForm.watch();

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
      const promptResult = await generateMemePromptAction({
        protagonist: findSelectedOption(allMemeOptions, storyData.protagonist)?.text || '',
        situation: findSelectedOption(allMemeOptions, storyData.situation)?.text || '',
        problem: findSelectedOption(allMemeOptions, storyData.problem)?.text || '',
        solution: findSelectedOption(allMemeOptions, storyData.solution)?.text || '',
        characterStyle: findSelectedStyle(characterStyles, styleData.characterStyle)?.keywords || '',
        sceneStyle: findSelectedStyle(sceneStyles, styleData.sceneStyle)?.keywords || '',
        outputFormat: findSelectedStyle(outputFormats, styleData.outputFormat)?.keywords || '',
      });

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
    styleForm.reset();
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
                 <Form {...storyForm}>
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
                </Form>
            )}

            {pageStep === 'stylize' && (
                 <Form {...styleForm}>
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
                                <FormField
                                    control={styleForm.control}
                                    name="characterStyle"
                                    render={({field}) => (
                                        <StyleSection field={field} title="🎨 Act 1: Define Your Character's Look" options={characterStyles} />
                                    )}
                                />
                                <FormField
                                    control={styleForm.control}
                                    name="sceneStyle"
                                    render={({field}) => (
                                        <StyleSection field={field} title="🎬 Act 2: Set the Scene's Atmosphere" options={sceneStyles} />
                                    )}
                                />
                                 <FormField
                                    control={styleForm.control}
                                    name="outputFormat"
                                    render={({field}) => (
                                        <StyleSection field={field} title="🖼️ Act 3: Choose Your Final Format" options={outputFormats} />
                                    )}
                                />
                            </CardContent>
                             <CardFooter>
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate Meme
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
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


function StyleSection({ field, title, options }: { field: any, title: string, options: StyleOption[] }) {
    return (
        <Card className="p-4">
            <FormLabel className="text-lg font-bold font-headline">{title}</FormLabel>
            <FormControl className="mt-4">
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                    {options.map((option) => (
                        <FormItem key={option.id} className={cn("flex items-start space-x-3 space-y-0 p-3 rounded-lg border transition-colors",
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
                    ))}
                </RadioGroup>
            </FormControl>
            <FormMessage className="mt-2" />
        </Card>
    );
}


    