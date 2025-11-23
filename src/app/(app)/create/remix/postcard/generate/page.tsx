
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generatePostcardImageAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const generateFormSchema = z.object({
  location: z.string().min(3, 'Please describe the location in at least 3 characters.'),
  style: z.enum(['photorealistic', 'watercolor']),
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;
type GenerationState = 'idle' | 'generating' | 'error';

export default function PostcardGeneratePage() {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
        location: '',
        style: 'photorealistic'
    }
  });

  const onSubmit = async (data: GenerateFormValues) => {
    setGenerationState('generating');
    setErrorMessage(null);

    try {
      const result = await generatePostcardImageAction(data);

      sessionStorage.setItem('postcardImage', result.cardDataUri);
      toast({
        title: 'Image Generated!',
        description: 'Your postcard image is ready to be styled.',
      });
      router.push('/create/remix/postcard-editor');
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setGenerationState('error');
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: message,
      });
    } finally {
        if(generationState !== 'error') {
            setGenerationState('idle');
        }
    }
  };

  const isLoading = generationState === 'generating';

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Generate a Postcard with AI</CardTitle>
              <CardDescription>Describe a place, real or imagined, and let AI create the view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Location or Scene</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 'Eiffel Tower in Paris', 'a cozy cabin in the Banff mountains'"
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
                name="style"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Choose a Style</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        disabled={isLoading}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="photorealistic" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Photorealistic
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="watercolor" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Watercolor Painting
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Generate Image</>
                )}
              </Button>
               {errorMessage && (
                    <p className="text-sm font-medium text-destructive">{errorMessage}</p>
                )}
              <Button variant="ghost" asChild>
                <Link href="/create/remix/postcard">
                  Back to options
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
