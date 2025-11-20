
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
import { Loader2, Wand2, UploadCloud, Download, Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type AspectRatioType = '9:16' | '16:9' | '1:1';

const modifyFormSchema = z.object({
  prompt: z.string().min(5, 'Please describe your desired modification in at least 5 characters.'),
  baseImage: z.any().refine(fileList => fileList.length === 1, 'Please upload one image file.'),
  strength: z.number().min(0.1).max(1.0),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']),
});

type ModifyFormValues = z.infer<typeof modifyFormSchema>;
type GenerationState = 'idle' | 'generating' | 'done' | 'error';

export default function ModifyImagePage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedCardUri, setGeneratedCardUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [strengthLabel, setStrengthLabel] = useState('Balanced');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<ModifyFormValues>({
    resolver: zodResolver(modifyFormSchema),
    defaultValues: {
      prompt: '',
      baseImage: undefined,
      strength: 0.5,
      aspectRatio: '9:16',
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

  const onSubmit = async (data: ModifyFormValues) => {
    setGenerationState('generating');
    setErrorMessage(null);
    setGeneratedCardUri(null);

    try {
      const imageFile = data.baseImage[0] as File;
      const photoDataUri = await fileToBase64(imageFile);
      
      const result = await generateCardAction({
        masterPrompt: "Modify the provided image based on the user's prompt.", // Master prompt not as important here
        personalizedPrompt: data.prompt,
        photoDataUri: photoDataUri,
        modificationStrength: data.strength,
        aspectRatio: data.aspectRatio,
      });

      setGeneratedCardUri(result.cardDataUri);
      setGenerationState('done');
      toast({
        title: 'Image Modified!',
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
    form.reset({ strength: 0.5, aspectRatio: '9:16' });
    setImagePreview(null);
    setGeneratedCardUri(null);
    setGenerationState('idle');
    setStrengthLabel('Balanced');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const handleStrengthChange = (value: number[]) => {
    const strength = value[0];
    form.setValue('strength', strength);
    if (strength <= 0.3) setStrengthLabel('Subtle Changes');
    else if (strength <= 0.7) setStrengthLabel('Balanced');
    else setStrengthLabel('Major Transformation');
  }

  const isLoading = generationState === 'generating';
  const finalAspectRatio = form.watch('aspectRatio');

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Modify an Image</CardTitle>
          <CardDescription>Upload a starting image, then use a prompt and sliders to transform it.</CardDescription>
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
                      <FormLabel>1. Upload Base Image</FormLabel>
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
                      <FormLabel>2. Describe Your Changes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Change the dog to a cat', 'Make it a watercolor painting', 'Add a superhero cape'"
                          rows={3}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>3. Modification Strength: <span className="font-bold text-primary">{strengthLabel}</span></FormLabel>
                            <FormControl>
                                <Slider
                                    defaultValue={[0.5]}
                                    min={0.1}
                                    max={1.0}
                                    step={0.05}
                                    onValueChange={handleStrengthChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="aspectRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Aspect Ratio</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                          disabled={isLoading}
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="9:16" />
                            </FormControl>
                            <FormLabel className="font-normal">Portrait</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="16:9" />
                            </FormControl>
                            <FormLabel className="font-normal">Landscape</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="1:1" />
                            </FormControl>
                            <FormLabel className="font-normal">Square</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Modifying...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> Generate Modification</>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
                <Label>Result</Label>
                <Card className="flex items-center justify-center bg-muted/50 border-dashed" style={{ aspectRatio: finalAspectRatio.replace(':', '/') }}>
                  {isLoading && (
                     <div className="text-center text-muted-foreground">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin mb-2" />
                        <p>Modifying your image...</p>
                     </div>
                  )}
                  {generationState === 'done' && generatedCardUri && (
                     <Image src={generatedCardUri} alt="Modified image result" fill className="object-contain rounded-md"/>
                  )}
                   {generationState === 'idle' && !generatedCardUri && (
                     <p className="text-muted-foreground p-4 text-center">Your modified image will appear here.</p>
                  )}
                  {generationState === 'error' && (
                     <p className="text-destructive p-4 text-center">{errorMessage || "An error occurred."}</p>
                  )}
                </Card>
                {generationState === 'done' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleReset} variant="outline">
                            <Repeat className="mr-2 h-4 w-4" /> Start Over
                        </Button>
                        <a href={generatedCardUri!} download="modified-creation.png">
                            <Button className="w-full">
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
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
