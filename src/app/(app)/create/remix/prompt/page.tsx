
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generatePromptFromImageAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Wand2, Copy, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';

const promptFormSchema = z.object({
  styleImage: z.any().refine(fileList => fileList.length === 1, 'Please upload one image file.'),
});

type PromptFormValues = z.infer<typeof promptFormSchema>;
type GenerationState = 'idle' | 'generating' | 'done' | 'error';

export default function GeneratePromptPage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      styleImage: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('styleImage', e.target.files);
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

  const onSubmit = async (data: PromptFormValues) => {
    setGenerationState('generating');
    setErrorMessage(null);
    setGeneratedPrompt('');

    try {
      const imageFile = data.styleImage[0] as File;
      const photoDataUri = await fileToBase64(imageFile);
      
      const result = await generatePromptFromImageAction({ photoDataUri });

      setGeneratedPrompt(result.generatedPrompt);
      setGenerationState('done');
      toast({
        title: 'Prompt Generated!',
        description: 'Your new prompt is ready to use.',
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
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: 'Prompt copied to clipboard!' });
  };
  
  const handleSendToAIStudio = () => {
    // In a real app, this would likely use a global state or router query
    // to pass the prompt to the AI Studio page. For now, we can just log it.
    console.log('Sending to AI Studio:', generatedPrompt);
    alert('This would navigate to the AI Studio with the prompt pre-filled.');
  };

  const isLoading = generationState === 'generating';

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate a Text Prompt</CardTitle>
          <CardDescription>Upload an image and our Vision AI will create a detailed, descriptive text prompt for you.</CardDescription>
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
                          <Image src={imagePreview} alt="Image preview" width={400} height={250} className="object-contain h-full w-full rounded-md" />
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
                
                <Button type="submit" className="w-full" disabled={isLoading || !imagePreview}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Image...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> Generate Prompt</>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
                <Label>Generated Prompt</Label>
                <Card className="min-h-[200px] flex items-center justify-center bg-muted/50 border-dashed p-4">
                  {isLoading && (
                     <div className="text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                        <p>Analyzing your image...</p>
                     </div>
                  )}
                  {generationState === 'done' && generatedPrompt && (
                     <Textarea 
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className="h-full bg-transparent border-0 focus-visible:ring-0"
                        rows={8}
                    />
                  )}
                   {generationState === 'idle' && (
                     <p className="text-muted-foreground text-center">Your generated prompt will appear here.</p>
                  )}
                  {generationState === 'error' && (
                     <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
                  )}
                </Card>
                {generationState === 'done' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleCopyToClipboard} variant="outline">
                           <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                        <Button onClick={handleSendToAIStudio}>
                           <Send className="mr-2 h-4 w-4" /> Use in AI Studio
                        </Button>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
            {generationState !== 'idle' && (
                <Button onClick={() => {
                    form.reset();
                    setImagePreview(null);
                    setGeneratedPrompt('');
                    setGenerationState('idle');
                }} variant="link">Start Over</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
