
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateCardAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

const styleFormSchema = z.object({
  prompt: z.string().min(10, 'Please describe your desired image in at least 10 characters.'),
  styleImage: z.any().refine(fileList => fileList.length === 1, 'Please upload one image file.'),
});

type StyleFormValues = z.infer<typeof styleFormSchema>;
type GenerationState = 'idle' | 'generating' | 'done' | 'error';

export default function StyleRemixPage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedCardUri, setGeneratedCardUri] = useState<string | null>(null);
  const [stylePreview, setStylePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<StyleFormValues>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: {
      prompt: '',
      styleImage: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('styleImage', e.target.files);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setStylePreview(loadEvent.target?.result as string);
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

  const onSubmit = async (data: StyleFormValues) => {
    setGenerationState('generating');
    setErrorMessage(null);
    setGeneratedCardUri(null);

    try {
      const imageFile = data.styleImage[0] as File;
      const photoDataUri = await fileToBase64(imageFile);
      
      const result = await generateCardAction({
        masterPrompt: "Apply the artistic style from the provided image.",
        personalizedPrompt: data.prompt,
        photoDataUri: photoDataUri,
      });

      setGeneratedCardUri(result.cardDataUri);
      setGenerationState('done');
      toast({
        title: 'Style Transfer Complete!',
        description: 'Your new image has been generated.',
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
    setStylePreview(null);
    setGeneratedCardUri(null);
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
          <CardTitle className="font-headline text-3xl">Remix with Style</CardTitle>
          <CardDescription>Upload an image to use as a style reference, then describe the new image you want the AI to create.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="styleImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1. Upload Style Image</FormLabel>
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
                        {stylePreview ? (
                          <Image src={stylePreview} alt="Style preview" width={400} height={250} className="object-contain h-full w-full rounded-md" />
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
                      <FormLabel>2. Describe New Image Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'A portrait of a robot cat', 'A fantasy landscape with floating islands', 'A delicious-looking cheeseburger'"
                          rows={4}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> Apply Style & Generate</>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
                <Label>Result</Label>
                <Card className="relative flex items-center justify-center bg-muted/50 border-dashed aspect-video">
                  {isLoading && (
                     <div className="text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                        <p>Applying style... this can take a moment.</p>
                     </div>
                  )}
                  {generationState === 'done' && generatedCardUri && (
                     <Image src={generatedCardUri} alt="Generated card from style" fill className="object-contain rounded-md"/>
                  )}
                   {generationState === 'idle' && !generatedCardUri && (
                     <p className="text-muted-foreground p-4 text-center">Your generated image will appear here.</p>
                  )}
                  {generationState === 'error' && (
                     <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
                  )}
                </Card>
                {generationState === 'done' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleReset} variant="outline">Create Another</Button>
                        <a href={generatedCardUri!} download="styled-creation.png">
                            <Button className="w-full">Download Image</Button>
                        </a>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
