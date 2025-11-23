
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateMemePromptAction, generateCardAction } from '@/app/actions';
import { memeFactoryData, MemeOption } from '@/lib/meme-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Repeat } from 'lucide-react';

type GenerationState = 'idle' | 'generating_prompt' | 'generating_image' | 'done' | 'error';

const formSchema = z.object({
  protagonist: z.string({ required_error: 'Please choose a protagonist.' }),
  situation: z.string({ required_error: 'Please choose a situation.' }),
  problem: z.string({ required_error: 'Please choose a problem.' }),
  solution: z.string({ required_error: 'Please choose a solution.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function MemeFactoryPage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedCardUri, setGeneratedCardUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setGenerationState('generating_prompt');
    setErrorMessage(null);
    setGeneratedCardUri(null);

    const findSelectedOption = (data: MemeOption[], selectedId: string): MemeOption | undefined => {
        const allOptions = memeFactoryData.flatMap(c => c.subCategories.flatMap(sc => sc.options));
        return allOptions.find(opt => opt.id === selectedId);
    }
    
    const allMemeOptions = memeFactoryData.flatMap(c => c.subCategories.flatMap(sc => sc.options));


    try {
      const promptInput = {
        protagonist: findSelectedOption(allMemeOptions, data.protagonist)?.text || '',
        situation: findSelectedOption(allMemeOptions, data.situation)?.text || '',
        problem: findSelectedOption(allMemeOptions, data.problem)?.text || '',
        solution: findSelectedOption(allMemeOptions, data.solution)?.text || '',
        // These are placeholders for now, will be implemented next
        characterStyle: '3D animated character',
        sceneStyle: 'dramatic black and white',
        outputFormat: 'Tarot card',
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
    form.reset();
    setGeneratedCardUri(null);
    setGeneratedPrompt(null);
    setErrorMessage(null);
    setGenerationState('idle');
  }

  const isLoading = generationState === 'generating_prompt' || generationState === 'generating_image';
  
  if (generationState === 'done' || generationState === 'generating_image' || generationState === 'generating_prompt' || generationState === 'error') {
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

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                <CardTitle>Build Your Story</CardTitle>
                <CardDescription>Follow the four steps to build your hilarious scenario.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                {memeFactoryData.map((category) => (
                    <FormField
                    key={category.id}
                    control={form.control}
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
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Meme
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </FormProvider>
    </div>
  );
}
