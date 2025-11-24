
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateVideoFromImageAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Film, UploadCloud, Download, Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const animateFormSchema = z.object({
  prompt: z.string().min(5, 'Please describe the animation in at least 5 characters.'),
  baseImage: z.any().refine(fileList => fileList.length === 1, 'Please upload one image file.'),
});

type AnimateFormValues = z.infer<typeof animateFormSchema>;
type GenerationState = 'idle' | 'generating' | 'done' | 'error';

export default function AnimatePage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedVideoUri, setGeneratedVideoUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<AnimateFormValues>({
    resolver: zodResolver(animateFormSchema),
    defaultValues: {
      prompt: '',
      baseImage: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('baseImage', e.target.files);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImagePreview(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: AnimateFormValues) => {
    setGenerationState('generating');
    setErrorMessage(null);
    setGeneratedVideoUri(null);

    try {
      const imageFile = data.baseImage[0] as File;
      const photoDataUri = await fileToBase64(imageFile);
      
      const result = await generateVideoFromImageAction({
        imageUrl: photoDataUri,
        prompt: data.prompt,
      });

      setGeneratedVideoUri(result.videoUrl);
      setGenerationState('done');
      toast({
        title: 'Animation Generated!',
        description: 'Your new video is ready.',
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
  
  const handleReset = () => {
    form.reset();
    setImagePreview(null);
    setGeneratedVideoUri(null);
    setGenerationState('idle');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const isLoading = generationState === 'generating';

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Animate Studio</CardTitle>
          <CardDescription>Upload an image, describe an animation, and watch your creation come to life.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="baseImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. Upload an Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <Card 
                        className="border-2 border-dashed hover:border-primary cursor-pointer aspect-video flex items-center justify-center text-muted-foreground"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <Image src={imagePreview} alt="Base image preview" width={400} height={250} className="object-contain h-full w-full rounded-md" />
                        ) : (
                          <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12" />
                            <p>Click to browse or drag & drop</p>
                          </div>
                        )}
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>2. Describe the Animation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'make the river flow', 'the person smiles and winks', 'add twinkling stars to the sky'"
                          rows={3}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading || !imagePreview}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Animating...</>
                  ) : (
                    <><Film className="mr-2 h-4 w-4" /> Generate Video</>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
                <Label>Result</Label>
                <Card className="relative flex items-center justify-center bg-muted/50 border-dashed aspect-video">
                  {isLoading && (
                     <div className="text-center text-muted-foreground p-4">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                        <p>Generating video... This may take up to a minute.</p>
                     </div>
                  )}
                  {generationState === 'done' && generatedVideoUri && (
                     <video src={generatedVideoUri} controls autoPlay loop className="w-full h-full object-contain rounded-md" />
                  )}
                   {generationState === 'idle' && !generatedVideoUri && (
                     <p className="text-muted-foreground p-4 text-center">Your animated video will appear here.</p>
                  )}
                  {generationState === 'error' && (
                     <Alert variant="destructive">
                        <AlertTitle>Animation Failed</AlertTitle>
                        <AlertDescription>
                           {errorMessage || "An unknown error occurred. The model might be busy. Please try again in a moment."}
                        </AlertDescription>
                     </Alert>
                  )}
                </Card>
                {generationState === 'done' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleReset} variant="outline">
                            <Repeat className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                        <a href={generatedVideoUri!} download="cardcraft-animation.mp4">
                            <Button className="w-full">
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </a>
                    </div>
                )}
                 {generationState === 'error' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleReset} variant="outline">
                            <Repeat className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
