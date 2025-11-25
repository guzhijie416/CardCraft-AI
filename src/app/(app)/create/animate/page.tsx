
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateCardAction, generateAnimatedSceneAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Repeat, Sparkle, Download, Film } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Step = 'generate_scene' | 'animate_scene' | 'done';
type GenerationState = 'idle' | 'generating_image' | 'generating_video' | 'error';

const sceneFormSchema = z.object({
  prompt: z.string().min(10, 'Please describe the scene in at least 10 characters.'),
});

const animateFormSchema = z.object({
    animationPrompt: z.string().min(10, 'Please describe the animation in at least 10 characters.'),
});

export default function AnimateStudioPage() {
  const [step, setStep] = useState<Step>('generate_scene');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  
  const [staticImageUri, setStaticImageUri] = useState<string | null>(null);
  const [animatedVideoUrl, setAnimatedVideoUrl] = useState<string | null>(null);
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
      const imageResult = await generateCardAction({
        masterPrompt: `A beautiful, detailed scene. Wide angle shot, cinematic.`,
        personalizedPrompt: data.prompt,
        aspectRatio: '16:9',
      });
      
      if (!imageResult || !imageResult.cardDataUri) {
          throw new Error("The AI failed to generate the static scene. Please try again.");
      }

      setStaticImageUri(imageResult.cardDataUri);
      setStep('animate_scene');
      setGenerationState('idle');
      toast({ title: "Scene created!", description: "Now, let's bring it to life by describing the animation." });

    } catch (error) {
      handleError(error, "The AI failed to generate the static scene. Please try again.");
    }
  };

  const handleAnimateSubmit = async (data: z.infer<typeof animateFormSchema>) => {
    if (!staticImageUri) {
        handleError(new Error("Cannot animate without a base image."));
        return;
    }
    setGenerationState('generating_video');
    setErrorMessage(null);
    setAnimatedVideoUrl(null);

    try {
      const videoResult = await generateAnimatedSceneAction({
        imageUrl: staticImageUri,
        prompt: data.animationPrompt,
      });

      if (!videoResult || !videoResult.videoUrl) {
        throw new Error("The AI failed to generate the animation. Please try again.");
      }
      
      setAnimatedVideoUrl(videoResult.videoUrl);
      setStep('done');
      setGenerationState('idle');
      toast({ title: 'Animation created!', description: 'Your scene is now a video.' });

    } catch (error) {
       handleError(error, error instanceof Error ? error.message : "An unknown animation error occurred.");
    }
  };

  const handleError = (error: unknown, defaultMessage?: string) => {
    const message = error instanceof Error ? error.message : defaultMessage || 'An unknown error occurred.';
    setErrorMessage(message);
    setGenerationState('error');
    toast({ variant: 'destructive', title: 'Generation Failed', description: message });
  };

  const handleStartOver = () => {
    sceneForm.reset();
    animateForm.reset();
    setStep('generate_scene');
    setGenerationState('idle');
    setStaticImageUri(null);
    setAnimatedVideoUrl(null);
    setErrorMessage(null);
  };
  
  const isLoading = generationState === 'generating_image' || generationState === 'generating_video';
  
  const renderLoadingState = () => (
    <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
        <Loader2 className="h-16 w-16 animate-spin text-primary"/>
        <p className="text-muted-foreground text-lg">
            {generationState === 'generating_image' ? 'Generating your scene...' : 'Animating your scene...'}
        </p>
        <p className="text-sm text-muted-foreground">(This may take up to a minute! Please do not leave the page.)</p>
    </CardContent>
  )

  const renderContent = () => {
    if (isLoading) {
        return renderLoadingState();
    }

    if (generationState === 'error') {
         return (
            <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <Alert variant="destructive">
                    <AlertTitle>Animation Failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
                <Button onClick={handleStartOver} variant="outline" className="mt-4">
                    <Repeat className="mr-2 h-4 w-4" /> Start Over
                </Button>
            </CardContent>
        );
    }
    
    switch (step) {
      case 'generate_scene':
        return (
            <Form {...sceneForm}>
                <form onSubmit={sceneForm.handleSubmit(handleSceneSubmit)}>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Animate Studio</CardTitle>
                        <CardDescription>Step 1: Describe the scene you want to bring to life.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={sceneForm.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Scene Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder={`e.g., A cozy living room with a stone fireplace on a winter night...`}
                                        rows={4}
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">
                            <Wand2 className="mr-2 h-4 w-4" /> Generate Scene
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        );
      case 'animate_scene':
        return (
             <Form {...animateForm}>
                <form onSubmit={animateForm.handleSubmit(handleAnimateSubmit)}>
                    <CardHeader>
                        <Button variant="ghost" onClick={handleStartOver} className="justify-start p-0 h-auto mb-2 text-muted-foreground">&larr; Start Over</Button>
                        <CardTitle className="font-headline text-3xl">Animate Your Scene</CardTitle>
                        <CardDescription>Step 2: Describe how the scene should animate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {staticImageUri && 
                            <Card className="relative w-full aspect-video overflow-hidden border">
                                <Image src={staticImageUri} layout="fill" objectFit="contain" alt="Generated static scene" className="bg-black" />
                            </Card>
                        }
                         <FormField
                            control={animateForm.control}
                            name="animationPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Animation Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder={`e.g., 'Make the fire in the fireplace flicker gently', 'make the snow fall outside the window'`}
                                        rows={3}
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg">
                           <Film className="mr-2 h-4 w-4" /> Animate Scene
                        </Button>
                    </CardFooter>
                </form>
             </Form>
        );
    case 'done':
        return (
            <>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Your Animation is Ready!</CardTitle>
                    <CardDescription>Your masterpiece has been generated.</CardDescription>
                </CardHeader>
                <CardContent>
                   {animatedVideoUrl && (
                        <div className="w-full aspect-video rounded-lg overflow-hidden border bg-black">
                            <video key={animatedVideoUrl} src={animatedVideoUrl} controls autoPlay loop playsInline className="w-full h-full object-contain" />
                        </div>
                   )}
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2">
                    <Button onClick={handleStartOver} variant="outline">
                        <Repeat className="mr-2 h-4 w-4" /> Create Another
                    </Button>
                     <a href={animatedVideoUrl!} download={`cardcraft-animation.mp4`}>
                        <Button className="w-full"><Download className="mr-2 h-4 w-4" /> Download Video</Button>
                    </a>
                </CardFooter>
            </>
        )
    default:
        return null;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </Card>
    </div>
  );
}
