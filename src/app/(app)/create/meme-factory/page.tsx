
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateMemePromptAction, generateCardAction } from '@/app/actions';
import { memeFactoryData, MemeOption } from '@/lib/meme-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Repeat, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const memeFactorySchema = z.object({
  protagonist: z.string({ required_error: 'Please choose a protagonist.' }),
  situation: z.string({ required_error: 'Please choose a situation.' }),
  problem: z.string({ required_error: 'Please choose a problem.' }),
  solution: z.string({ required_error: 'Please choose a solution.' }),
});

type MemeFactoryFormValues = z.infer<typeof memeFactorySchema>;
type GenerationState = 'idle' | 'generating_prompt' | 'generating_image' | 'done' | 'error';

export default function MemeFactoryPage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<MemeFactoryFormValues>({
    resolver: zodResolver(memeFactorySchema),
  });
  
  const selectedValues = form.watch();

  const findSelectedOption = (categoryId: 'protagonist' | 'situation' | 'problem' | 'solution', selectedId: string): MemeOption | undefined => {
      const category = memeFactoryData.find(c => c.id === categoryId);
      return category?.subCategories.flatMap(sc => sc.options).find(opt => opt.id === selectedId);
  }

  const onSubmit = async (data: MemeFactoryFormValues) => {
    setGenerationState('generating_prompt');
    setErrorMessage(null);
    setGeneratedImageUri(null);
    setGeneratedPrompt(null);
    
    try {
      // 1. Generate the detailed prompt
      const promptResult = await generateMemePromptAction({
        protagonist: findSelectedOption('protagonist', data.protagonist)?.text || '',
        situation: findSelectedOption('situation', data.situation)?.text || '',
        problem: findSelectedOption('problem', data.problem)?.text || '',
        solution: findSelectedOption('solution', data.solution)?.text || '',
      });

      if (!promptResult || !promptResult.memePrompt) {
        throw new Error("The AI failed to generate a meme prompt. Please try again.");
      }
      
      setGeneratedPrompt(promptResult.memePrompt);
      setGenerationState('generating_image');
      
      // 2. Generate the image using the new prompt
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

  const isLoading = generationState === 'generating_prompt' || generationState === 'generating_image';

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">The Meme Factory</h1>
        <p className="text-muted-foreground mt-2 text-lg">Your Inside Jokes, Instantly Illustrated.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Create Your Meme</CardTitle>
                  <CardDescription>Follow the four steps to build your hilarious scenario.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {memeFactoryData.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
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
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {generationState === 'generating_prompt' && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Weaving the Story...</>}
                    {generationState === 'generating_image' && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Painting the Meme...</>}
                    {isLoading || <><Wand2 className="mr-2 h-4 w-4" /> Generate Meme</>}
                  </Button>
                </CardFooter>
              </form>
            </Form>
        </Card>
        
        <div className="space-y-6 sticky top-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Masterpiece</CardTitle>
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
                        {generationState === 'idle' && (
                            <div className="text-center p-4 text-muted-foreground">
                               <Sparkles className="mx-auto h-12 w-12 mb-2"/>
                               <p>Your generated meme will appear here.</p>
                            </div>
                        )}
                        {generationState === 'error' && (
                            <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
                        )}
                    </Card>
                </CardContent>
                 {generationState === 'done' && generatedImageUri && (
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button onClick={() => form.reset()} variant="outline">
                            <Repeat className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                        <a href={generatedImageUri} download="cardcraft-meme.png">
                            <Button className="w-full">
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </a>
                    </CardFooter>
                )}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Meme Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="w-28 justify-center">Protagonist</Badge>
                        <span className="text-muted-foreground">{findSelectedOption('protagonist', selectedValues.protagonist)?.text || '...'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="w-28 justify-center">Situation</Badge>
                        <span className="text-muted-foreground">{findSelectedOption('situation', selectedValues.situation)?.text || '...'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="w-28 justify-center">Problem</Badge>
                        <span className="text-muted-foreground">{findSelectedOption('problem', selectedValues.problem)?.text || '...'}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="w-28 justify-center">Solution</Badge>
                        <span className="text-muted-foreground">{findSelectedOption('solution', selectedValues.solution)?.text || '...'}</span>
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
