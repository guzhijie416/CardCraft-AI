
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateAnimatedSceneAction, generateCardAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Repeat, Wind, PartyPopper, Flame, Sparkle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Step = 'select_effect' | 'generate_scene' | 'done';
type GenerationState = 'idle' | 'generating_image' | 'generating_video' | 'error' | 'done';

const animationEffects = [
    { category: 'Atmosphere', icon: Wind, effects: [ { id: 'snow', name: 'Snow', prompt: 'make it snow gently' }, { id: 'rain', name: 'Rain', prompt: 'make it rain lightly' } ] },
    { category: 'Celebration', icon: PartyPopper, effects: [ { id: 'fireworks', name: 'Fireworks', prompt: 'add fireworks in the sky' }, { id: 'confetti', name: 'Confetti', prompt: 'add falling confetti' } ] },
    { category: 'Elements', icon: Flame, effects: [ { id: 'fire', name: 'Fire', prompt: 'make the fire crackle and glow' }, { id: 'water', name: 'Water', prompt: 'make the water ripple gently' } ] },
    { category: 'Holiday', icon: Sparkle, effects: [ { id: 'twinkle_lights', name: 'Twinkling Lights', prompt: 'make the lights twinkle' }, { id: 'flare_candles', name: 'Flaring Candles', prompt: 'light the candles, make the flames flicker' } ] },
];

const sceneFormSchema = z.object({
  prompt: z.string().min(10, 'Please describe the scene in at least 10 characters.'),
});

export default function AnimateStudioPage() {
  const [step, setStep] = useState<Step>('select_effect');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [selectedEffect, setSelectedEffect] = useState<{id: string, name: string, prompt: string} | null>(null);
  const [staticImageUri, setStaticImageUri] = useState<string | null>(null);
  const [animatedVideoUri, setAnimatedVideoUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  const sceneForm = useForm<z.infer<typeof sceneFormSchema>>({
    resolver: zodResolver(sceneFormSchema),
    defaultValues: { prompt: '' },
  });

  const handleEffectSelect = (effect: {id: string, name: string, prompt: string}) => {
    setSelectedEffect(effect);
    setStep('generate_scene');
  };

  const handleSceneSubmit = async (data: z.infer<typeof sceneFormSchema>) => {
    if (!selectedEffect) {
        toast({ variant: 'destructive', title: 'Error', description: 'No animation effect was selected.' });
        return;
    }
    
    setGenerationState('generating_image');
    setErrorMessage(null);
    setStaticImageUri(null);

    try {
      // --- Step 1: Generate Static Image ---
      const imageResult = await generateCardAction({
        masterPrompt: "A beautiful, detailed scene.",
        personalizedPrompt: data.prompt,
        aspectRatio: '16:9',
      });
      
      if (!imageResult || !imageResult.cardDataUri) {
          throw new Error("The AI failed to generate the static scene. Please try again.");
      }

      setStaticImageUri(imageResult.cardDataUri);
      setGenerationState('generating_video');
      toast({ title: "Scene created!", description: "Now, let's bring it to life..." });
      
      // --- Step 2: Generate Animation ---
      const result = await generateAnimatedSceneAction({
        scenePrompt: data.prompt, // Pass scene prompt for context if needed, though not strictly used in action
        animationPrompt: selectedEffect.prompt,
        staticImageUrl: imageResult.cardDataUri, // Pass the generated image URI
      });
      
      if (!result || !result.animatedVideoUrl) {
        throw new Error("The AI failed to generate the animation. Please try again.");
      }

      setAnimatedVideoUri(result.animatedVideoUrl);
      setGenerationState('done');
      setStep('done');

      toast({
        title: 'Animation Complete!',
        description: 'Your animated scene is ready.',
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setGenerationState('error');
      toast({ variant: 'destructive', title: 'Generation Failed', description: message });
    }
  };
  
  const handleStartOver = () => {
    sceneForm.reset();
    setStep('select_effect');
    setGenerationState('idle');
    setSelectedEffect(null);
    setStaticImageUri(null);
    setAnimatedVideoUri(null);
    setErrorMessage(null);
  };

  const isLoading = generationState === 'generating_image' || generationState === 'generating_video';


  const renderContent = () => {
    switch (step) {
      case 'select_effect':
        return (
            <>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Animate Studio</CardTitle>
                    <CardDescription>Step 1: Choose an animation effect to bring your scene to life.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {animationEffects.map(({ category, icon: Icon, effects }) => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold flex items-center mb-3"><Icon className="mr-2 h-5 w-5 text-primary"/>{category}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {effects.map(effect => (
                                    <Button key={effect.id} variant="outline" onClick={() => handleEffectSelect(effect)}>
                                        {effect.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </>
        )
      case 'generate_scene':
        return (
             <FormProvider {...sceneForm}>
                <form onSubmit={sceneForm.handleSubmit(handleSceneSubmit)}>
                    <CardHeader>
                        <Button variant="ghost" onClick={() => setStep('select_effect')} className="justify-start p-0 h-auto mb-2 text-muted-foreground">&larr; Back to effects</Button>
                        <CardTitle className="font-headline text-3xl">Describe Your Scene</CardTitle>
                        <CardDescription>You chose the <span className="font-bold text-primary">{selectedEffect?.name}</span> effect. Now describe a scene where it can happen!</CardDescription>
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
                                        placeholder={`e.g., For 'Fire', you might describe 'A cozy living room with a stone fireplace'...`}
                                        rows={4}
                                        {...field}
                                        disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {generationState === 'error' && errorMessage && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                         {staticImageUri && generationState !== 'generating_video' && (
                           <div className="mt-4">
                               <p className="text-sm font-medium">Generated Scene:</p>
                               <Image src={staticImageUri} width={400} height={225} alt="Generated static scene" className="rounded-md border mt-2" />
                           </div>
                         )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {generationState === 'generating_image' ? 'Generating Scene...' : 'Animating Scene...'}</>
                            ) : (
                                <><Wand2 className="mr-2 h-4 w-4" /> Generate & Animate</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
             </FormProvider>
        )
      case 'done':
        return (
            <>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Animation Complete!</CardTitle>
                    <CardDescription>Your animated scene is ready to be shared.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <Card className="relative w-full aspect-video">
                         {animatedVideoUri ? (
                            <video src={animatedVideoUri} controls autoPlay loop className="w-full h-full object-contain rounded-md bg-black" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center bg-muted">
                                <p>Video loading...</p>
                             </div>
                         )}
                    </Card>
                     {generationState === 'error' && (
                        <Alert variant="destructive">
                            <AlertTitle>Animation Failed</AlertTitle>
                            <AlertDescription>{errorMessage || "An unknown error occurred."}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="grid sm:grid-cols-2 gap-2">
                    <Button onClick={handleStartOver} variant="outline" className="w-full">
                        <Repeat className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                    <a href={animatedVideoUri!} download="cardcraft-animation.mp4">
                        <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
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
        {isLoading ? (
             <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <Loader2 className="h-16 w-16 animate-spin text-primary"/>
                <p className="text-muted-foreground text-lg">{generationState === 'generating_image' ? 'Generating your masterpiece...' : 'Animating the scene...'}</p>
                <p className="text-sm text-muted-foreground">(This may take up to a minute!)</p>
                {staticImageUri && (
                    <div className="mt-4">
                        <p className="text-xs font-medium">Generated Scene:</p>
                        <Image src={staticImageUri} width={200} height={112} alt="Generated static scene" className="rounded-md border mt-1 opacity-50" />
                    </div>
                )}
            </CardContent>
        ) : renderContent()}
      </Card>
    </div>
  );
}
