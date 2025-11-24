'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateCardAction } from '@/app/actions';
import { animationEffects, type AnimationEffect } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Repeat, Sparkle, Wind, PartyPopper, Flame, Music, Download } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ClientRecorder } from '@/components/client-recorder';

type Step = 'generate_scene' | 'animate_scene' | 'export_scene';
type GenerationState = 'idle' | 'generating_image' | 'error';
type ExportState = 'idle' | 'recording' | 'done' | 'error';

const sceneFormSchema = z.object({
  prompt: z.string().min(10, 'Please describe the scene in at least 10 characters.'),
});

export default function AnimateStudioPage() {
  const [step, setStep] = useState<Step>('generate_scene');
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [exportState, setExportState] = useState<ExportState>('idle');

  const [staticImageUri, setStaticImageUri] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<AnimationEffect | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();

  const sceneForm = useForm<z.infer<typeof sceneFormSchema>>({
    resolver: zodResolver(sceneFormSchema),
    defaultValues: { prompt: '' },
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
      toast({ title: "Scene created!", description: "Now, let's bring it to life by adding an effect." });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setGenerationState('error');
      toast({ variant: 'destructive', title: 'Generation Failed', description: message });
    }
  };

  const handleStartOver = () => {
    sceneForm.reset();
    setStep('generate_scene');
    setGenerationState('idle');
    setExportState('idle');
    setSelectedEffect(null);
    setStaticImageUri(null);
    setErrorMessage(null);
  };
  
  const handleExport = () => {
    setExportState('recording');
    toast({
        title: 'Recording started!',
        description: 'Your animation is being recorded in-browser. Please wait...',
    });
  }

  const isLoadingImage = generationState === 'generating_image';

  const renderContent = () => {
    switch (step) {
      case 'generate_scene':
        return (
             <FormProvider {...sceneForm}>
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
                                        disabled={isLoadingImage}
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
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg" disabled={isLoadingImage}>
                            {isLoadingImage ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Scene...</>
                            ) : (
                                <><Wand2 className="mr-2 h-4 w-4" /> Generate Scene</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
             </FormProvider>
        );
      case 'animate_scene':
        return (
             <>
                <CardHeader>
                    <Button variant="ghost" onClick={handleStartOver} className="justify-start p-0 h-auto mb-2 text-muted-foreground">&larr; Start Over</Button>
                    <CardTitle className="font-headline text-3xl">Animate Your Scene</CardTitle>
                    <CardDescription>Step 2: Choose an animation effect to layer over your scene.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Card className="relative w-full aspect-video overflow-hidden">
                        {staticImageUri && <Image src={staticImageUri} layout="fill" objectFit="contain" alt="Generated static scene" className="bg-black" />}
                        {selectedEffect && (
                            <video
                                key={selectedEffect.videoUrl}
                                src={selectedEffect.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
                            />
                        )}
                    </Card>

                    <div className="w-full space-y-6">
                        {animationEffects.map(({ category, icon: Icon, effects }) => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold flex items-center mb-3"><Icon className="mr-2 h-5 w-5 text-primary"/>{category}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {effects.map(effect => (
                                        <Button 
                                            key={effect.id} 
                                            variant={selectedEffect?.id === effect.id ? 'default' : 'outline'}
                                            onClick={() => setSelectedEffect(effect)}>
                                            {effect.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setStep('export_scene')} className="w-full" size="lg" disabled={!selectedEffect}>
                       <Music className="mr-2 h-4 w-4" /> Next: Add Music & Export
                    </Button>
                </CardFooter>
             </>
        );
    case 'export_scene':
        return (
            <>
                <CardHeader>
                     <Button variant="ghost" onClick={() => setStep('animate_scene')} className="justify-start p-0 h-auto mb-2 text-muted-foreground">&larr; Back to Effects</Button>
                    <CardTitle className="font-headline text-3xl">Finalize & Export</CardTitle>
                    <CardDescription>Your masterpiece is ready! Click export to create the video file.</CardDescription>
                </CardHeader>
                <CardContent>
                   {staticImageUri && selectedEffect && (
                       <ClientRecorder
                            baseImage={staticImageUri}
                            overlayVideo={selectedEffect.videoUrl}
                            soundtrack={selectedEffect.soundUrl}
                            onRecordingStart={handleExport}
                            onRecordingComplete={(url) => {
                                setExportState('done');
                                toast({
                                    title: "Recording Complete!",
                                    description: "Your video is ready for download.",
                                    action: (
                                        <a href={url} download={`cardcraft-animation.webm`}>
                                            <Button><Download className="mr-2 h-4 w-4" /> Download</Button>
                                        </a>
                                    )
                                })
                            }}
                            onRecordingError={(err) => {
                                setExportState('error');
                                setErrorMessage(err);
                            }}
                        />
                   )}
                </CardContent>
                <CardFooter>
                     <Button onClick={handleStartOver} variant="outline" className="w-full">
                        <Repeat className="mr-2 h-4 w-4" /> Create a New Animation
                    </Button>
                </CardFooter>
            </>
        )
    default:
        return null;
    }
  }

  const isLoading = isLoadingImage || exportState === 'recording';
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        {isLoading ? (
             <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <Loader2 className="h-16 w-16 animate-spin text-primary"/>
                <p className="text-muted-foreground text-lg">
                    {generationState === 'generating_image' ? 'Generating your scene...' : 'Recording your animation...'}
                </p>
                <p className="text-sm text-muted-foreground">(This may take a moment! Please do not leave the page.)</p>
            </CardContent>
        ) : renderContent()}
      </Card>
    </div>
  );
}
