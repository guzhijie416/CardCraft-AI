
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateCardAction, generateVideoFromImageAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Film, Sparkles, Wand2, Download, Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Step = 'generate' | 'animate';
type GenerationState = 'idle' | 'generating_image' | 'generating_video' | 'done' | 'error';

const sceneFormSchema = z.object({
  prompt: z.string().min(10, 'Please describe the scene in at least 10 characters.'),
});

const animateFormSchema = z.object({
  animationPrompt: z.string().min(5, 'Please describe the animation.'),
});

export default function AnimateStudioPage() {
  const [step, setStep] = useState<Step>('generate');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [staticImageUri, setStaticImageUri] = useState<string | null>(null);
  const [animatedVideoUri, setAnimatedVideoUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  const sceneForm = useForm<z.infer<typeof sceneFormSchema>>({
    resolver: zodResolver(sceneFormSchema),
    defaultValues: { prompt: '' },
  });

  const animateForm = useForm<z.infer<typeof animateFormSchema>>({
    resolver: zodResolver(animateFormSchema),
    defaultValues: { animationPrompt: '' },
  });

  const handleSceneSubmit = async (data: z.infer<typeof sceneFormSchema>) => {
    setGenerationState('generating_image');
    setErrorMessage(null);
    setStaticImageUri(null);

    try {
      const result = await generateCardAction({
        masterPrompt: "A beautiful, detailed scene.",
        personalizedPrompt: data.prompt,
        aspectRatio: '16:9', // Default to landscape for scenes
      });
      
      if (!result || !result.cardDataUri) {
        throw new Error("The AI failed to generate an image. Please try again.");
      }

      setStaticImageUri(result.cardDataUri);
      setGenerationState('idle');
      setStep('animate');
      toast({
        title: 'Scene Generated!',
        description: "Now, let's bring it to life.",
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setGenerationState('error');
      toast({ variant: 'destructive', title: 'Scene Generation Failed', description: message });
    }
  };

  const handleAnimationSubmit = async (data: z.infer<typeof animateFormSchema>) => {
    if (!staticImageUri) {
        toast({ variant: 'destructive', title: 'Error', description: 'No base image available to animate.' });
        return;
    }
    setGenerationState('generating_video');
    setErrorMessage(null);

    try {
        const result = await generateVideoFromImageAction({
            imageUrl: staticImageUri,
            prompt: data.animationPrompt,
        });

        if (!result || !result.videoUrl) {
            throw new Error("The AI failed to generate a video. Please try again.");
        }

        setAnimatedVideoUri(result.videoUrl);
        setGenerationState('done');
        toast({ title: 'Animation Complete!', description: 'Your scene is now alive.' });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        setErrorMessage(message);
        setGenerationState('error');
        toast({ variant: 'destructive', title: 'Animation Failed', description: message });
    }
  };
  
  const handleStartOver = () => {
    sceneForm.reset();
    animateForm.reset();
    setStep('generate');
    setGenerationState('idle');
    setStaticImageUri(null);
    setAnimatedVideoUri(null);
    setErrorMessage(null);
  };

  const isGeneratingImage = generationState === 'generating_image';
  const isGeneratingVideo = generationState === 'generating_video';
  const isLoading = isGeneratingImage || isGeneratingVideo;

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Animate Studio</CardTitle>
          <CardDescription>
            {step === 'generate'
              ? 'First, describe the beautiful static scene you want to create.'
              : 'Your scene is ready. Now, describe how you want to bring it to life.'}
          </CardDescription>
        </CardHeader>
        
        {step === 'generate' && (
             <FormProvider {...sceneForm}>
                <form onSubmit={sceneForm.handleSubmit(handleSceneSubmit)}>
                    <CardContent>
                        <FormField
                            control={sceneForm.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Describe Your Scene</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="e.g., 'A cozy living room with a fireplace, a birthday cake on the table, and a window showing the night sky.'"
                                        rows={4}
                                        {...field}
                                        disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {generationState === 'error' && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isGeneratingImage ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Scene...</>
                            ) : (
                                <><Sparkles className="mr-2 h-4 w-4" /> Generate Scene</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
             </FormProvider>
        )}

        {step === 'animate' && staticImageUri && (
            <div className="grid md:grid-cols-2 gap-8 items-start p-6">
                <div className="space-y-4">
                    <Label>Your Canvas</Label>
                    <Card className="relative aspect-video">
                        <Image src={staticImageUri} alt="Generated scene" fill className="object-cover rounded-md"/>
                    </Card>
                    <FormProvider {...animateForm}>
                        <form onSubmit={animateForm.handleSubmit(handleAnimationSubmit)} className="space-y-4">
                           <FormField
                                control={animateForm.control}
                                name="animationPrompt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">Describe the Animation</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., 'Make the fire crackle', 'light the birthday candles', 'add gentle snowfall outside the window'"
                                                rows={3}
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isGeneratingVideo ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Animating...</>
                                ) : (
                                    <><Wand2 className="mr-2 h-4 w-4" /> Animate</>
                                )}
                            </Button>
                        </form>
                    </FormProvider>
                </div>
                <div className="space-y-4">
                    <Label>Final Animation</Label>
                    <Card className="relative flex items-center justify-center bg-muted/50 border-dashed aspect-video">
                        {isGeneratingVideo && (
                            <div className="text-center text-muted-foreground p-4">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                                <p>Generating video... This may take up to a minute.</p>
                            </div>
                        )}
                        {generationState === 'done' && animatedVideoUri && (
                            <video src={animatedVideoUri} controls autoPlay loop className="w-full h-full object-contain rounded-md" />
                        )}
                        {generationState !== 'generating_video' && !animatedVideoUri &&(
                            <p className="text-muted-foreground p-4 text-center">Your final animated video will appear here.</p>
                        )}
                        {generationState === 'error' && (
                            <Alert variant="destructive">
                                <AlertTitle>Animation Failed</AlertTitle>
                                <AlertDescription>{errorMessage || "An unknown error occurred."}</AlertDescription>
                            </Alert>
                        )}
                    </Card>
                    
                    {generationState === 'done' && animatedVideoUri && (
                        <div className="grid grid-cols-2 gap-2">
                             <a href={animatedVideoUri!} download="cardcraft-animation.mp4">
                                <Button className="w-full">
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </a>
                        </div>
                    )}
                    
                     <Button onClick={handleStartOver} variant="outline" className="w-full">
                        <Repeat className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                </div>
            </div>
        )}

      </Card>
    </div>
  );
}
