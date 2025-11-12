'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  analyzePromptAction,
  filterContentAction,
  generateCardAction,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2, Lightbulb, Download, Mail, Printer } from 'lucide-react';
import type { MasterPrompt } from '@/lib/data';
import type { SummarizeAndImproveUserPromptOutput } from '@/ai/flows/summarize-and-improve-user-prompt';

const formSchema = z.object({
  personalizedPrompt: z.string().min(10, {
    message: 'Please describe your card in at least 10 characters.',
  }),
});

type EditorState = 'idle' | 'analyzing' | 'needs_improvement' | 'generating' | 'done' | 'error';

export function AiCardEditor({ masterPrompt, photoDataUri }: { masterPrompt: MasterPrompt, photoDataUri?: string }) {
  const [editorState, setEditorState] = useState<EditorState>('idle');
  const [analysis, setAnalysis] = useState<SummarizeAndImproveUserPromptOutput | null>(null);
  const [finalCardUri, setFinalCardUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalizedPrompt: '',
    },
  });
  
  const modifiedMasterPrompt = photoDataUri
    ? `${masterPrompt.prompt} Use the following image as the primary background and inspiration.`
    : masterPrompt.prompt;
    
  const generateCardInput = (promptToUse: string) => {
    let input: any = {
        masterPrompt: modifiedMasterPrompt,
        personalizedPrompt: promptToUse,
    }
    if (photoDataUri) {
        input.photoDataUri = photoDataUri
    }
    return input;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setEditorState('analyzing');
    setErrorMessage(null);

    try {
      // Step 1: Analyze and improve prompt
      const analysisResult = await analyzePromptAction({
        userPrompt: values.personalizedPrompt,
        masterPrompt: modifiedMasterPrompt,
      });

      setAnalysis(analysisResult);

      if (!analysisResult.isGoodPrompt) {
        setEditorState('needs_improvement');
      } else {
        await proceedToGeneration(analysisResult.improvedPrompt);
      }
    } catch (error) {
      handleError(error, 'Could not analyze your prompt.');
    }
  }

  async function proceedToGeneration(promptToUse: string) {
    setEditorState('generating');
    setErrorMessage(null);

    try {
      // Step 2: Filter content
      const filterResult = await filterContentAction({ content: promptToUse });
      if (!filterResult.isSafe) {
        handleError(new Error(filterResult.reason), 'Your prompt was flagged as inappropriate. Please revise it.');
        setEditorState('idle');
        return;
      }

      // Step 3: Generate card
      const cardResult = await generateCardAction(generateCardInput(promptToUse));

      setFinalCardUri(cardResult.cardDataUri);
      setEditorState('done');
      toast({
        title: 'Success!',
        description: 'Your unique AI card has been generated.',
      });
    } catch (error) {
      handleError(error, 'There was an issue generating your card.');
    }
  }

  function handleError(error: unknown, defaultMessage: string) {
    const message = error instanceof Error ? error.message : defaultMessage;
    setErrorMessage(message);
    setEditorState('error');
    toast({
      variant: 'destructive',
      title: 'An error occurred',
      description: message,
    });
  }

  function handleReset() {
    setEditorState('idle');
    setAnalysis(null);
    setFinalCardUri(null);
    setErrorMessage(null);
    form.reset();
  }

  const isLoading = editorState === 'analyzing' || editorState === 'generating';

  if (editorState === 'done' && finalCardUri) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Your Card is Ready!</CardTitle>
          <CardDescription>Download, share, or print your creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-[4/5] w-full rounded-lg overflow-hidden border">
            <Image src={finalCardUri} alt="Generated AI card" width={400} height={500} className="w-full h-full object-contain" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button><Download className="mr-2 h-4 w-4" /> Download</Button>
            <Button variant="secondary"><Mail className="mr-2 h-4 w-4" /> Email</Button>
            <Button variant="secondary"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
          <Button variant="outline" className="w-full" onClick={handleReset}>
            Create Another Card
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Personalize Your AI Card</CardTitle>
        <CardDescription>You chose the <span className="font-bold text-primary">{masterPrompt.name}</span> style. Now, add your personal touch.</CardDescription>
        {photoDataUri && (
             <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Your Photo:</p>
                <Image src={photoDataUri} alt="User photo for postcard" width={200} height={150} className="rounded-md border" />
             </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {editorState === 'needs_improvement' && analysis && (
          <Alert variant="default" className="bg-accent/20 border-accent/50">
            <Lightbulb className="h-4 w-4 text-accent" />
            <AlertTitle className="font-headline text-accent">Prompt Improvement Suggestion</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>{analysis.summary}</p>
              <div>
                <p className="font-semibold mb-1">Suggested Prompt:</p>
                <blockquote className="border-l-2 pl-4 italic text-sm">{analysis.improvedPrompt}</blockquote>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => proceedToGeneration(analysis.improvedPrompt)}>
                  {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Wand2 className="mr-2 h-4 w-4" />)}
                  Use Suggestion & Generate
                </Button>
                <Button variant="outline" onClick={() => setEditorState('idle')}>
                  Let Me Edit
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personalizedPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Describe your card</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'A watercolor painting of a calico cat wearing a tiny crown, sitting on a pile of books. Soft, dreamy lighting.'"
                      rows={5}
                      {...field}
                      disabled={isLoading || editorState === 'needs_improvement'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errorMessage && (
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || editorState === 'needs_improvement'}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editorState === 'analyzing' ? 'Analyzing...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate My Card
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
