
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
  generateMessagesAction,
  generateRefinedPromptAction,
  saveAndShareCardAction,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2, Lightbulb, Download, Share2, Printer, MessageSquareQuote, Settings, ChevronDown, XCircle, AspectRatio } from 'lucide-react';
import type { MasterPrompt } from '@/lib/data';
import { masterPrompts as allMasterPrompts } from '@/lib/data';
import type { SummarizeAndImproveUserPromptOutput } from '@/ai/flows/summarize-and-improve-user-prompt';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { GenerateRefinedPromptOutput } from '@/ai/flows/generate-refined-prompt';


const formSchema = z.object({
  personalizedPrompt: z.string().min(10, {
    message: 'Please describe your card in at least 10 characters.',
  }),
});

type EditorState = 'idle' | 'analyzing' | 'needs_improvement' | 'generating' | 'done' | 'error';
type MessageState = 'idle' | 'generating' | 'done' | 'error';
type RefinedPromptState = 'idle' | 'generating' | 'done' | 'error';
type AspectRatioType = '9:16' | '16:9' | '1:1';


const refinementOptions = {
  artisticMedium: [
    { id: 'am-1', value: 'watercolor painting', label: 'Watercolor' },
    { id: 'am-2', value: 'oil painting', label: 'Oil Painting' },
    { id: 'am-3', value: 'charcoal sketch', label: 'Charcoal Sketch' },
    { id: 'am-4', value: 'vintage postcard', label: 'Vintage Postcard' },
  ],
  colorPalette: [
    { id: 'cp-1', value: 'a soft pastel color palette', label: 'Soft Pastels' },
    { id: 'cp-2', value: 'vibrant and bold colors', label: 'Vibrant & Bold' },
    { id: 'cp-3', value: 'a warm and earthy palette', label: 'Warm & Earthy' },
  ],
  composition: [
    { id: 'co-1', value: 'close-up portrait', label: 'Close-up Portrait' },
    { id: 'co-2', value: 'cinematic wide shot', label: 'Cinematic Wide Shot' },
    { id: 'co-3', value: 'symmetrical composition', label: 'Symmetrical' },
  ],
  lighting: [
    { id: 'li-1', value: 'soft diffused lighting', label: 'Soft & Diffused' },
    { id: 'li-2', value: 'dramatic, high-contrast lighting', label: 'High-Contrast' },
    { id: 'li-3', value: 'golden hour glow', label: 'Golden Hour' },
  ],
  texture: [
    { id: 'te-1', value: 'textured paper', label: 'Textured Paper' },
    { id: 'te-2', value: 'embossed details', label: 'Embossed' },
    { id: 'te-3', value: 'gold foil accents', label: 'Gold Foil' },
  ],
};


export function AiCardEditor({ masterPrompt, photoDataUri }: { masterPrompt: MasterPrompt, photoDataUri?: string }) {
  const [editorState, setEditorState] = useState<EditorState>('idle');
  const [messageState, setMessageState] = useState<MessageState>('idle');
  const [refinedPromptState, setRefinedPromptState] = useState<RefinedPromptState>('idle');
  
  const [analysis, setAnalysis] = useState<SummarizeAndImproveUserPromptOutput | null>(null);
  const [refinedPrompt, setRefinedPrompt] = useState<GenerateRefinedPromptOutput | null>(null);
  
  const [finalCardUri, setFinalCardUri] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState<string>('');
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for refinement selections
  const [artisticMedium, setArtisticMedium] = useState<string | undefined>();
  const [colorPalette, setColorPalette] = useState<string | undefined>();
  const [composition, setComposition] = useState<string | undefined>();
  const [lighting, setLighting] = useState<string | undefined>();
  const [texture, setTexture] = useState<string | undefined>();
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');


  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalizedPrompt: '',
    },
  });

  const relevantMasterPrompts = allMasterPrompts.filter(p => p.occasion === masterPrompt.occasion);
  
  const modifiedMasterPrompt = photoDataUri
    ? `${masterPrompt.prompt} Use the following image as the primary background and inspiration.`
    : masterPrompt.prompt;
    
  const generateCardInput = (promptToUse: string) => {
    let input: any = {
        masterPrompt: modifiedMasterPrompt,
        personalizedPrompt: promptToUse,
        aspectRatio: aspectRatio
    }
    if (photoDataUri) {
        input.photoDataUri = photoDataUri
    }
    return input;
  }

  async function onAnalyze() {
    setEditorState('analyzing');
    setErrorMessage(null);

    try {
      const analysisResult = await analyzePromptAction({
        userPrompt: form.getValues('personalizedPrompt'),
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

  async function onGenerateRefinedPrompt() {
    setRefinedPromptState('generating');
    setErrorMessage(null);

    try {
        const result = await generateRefinedPromptAction({
            basePrompt: form.getValues('personalizedPrompt'),
            artisticMedium,
            colorPalette,
            composition,
            lighting,
            texture
        });
        setRefinedPrompt(result);
        setRefinedPromptState('done');
    } catch (error) {
        handleError(error, 'Could not generate a refined prompt.');
        setRefinedPromptState('error');
    }
  }


  async function proceedToGeneration(promptToUse: string) {
    setEditorState('generating');
    setErrorMessage(null);

    try {
      const filterResult = await filterContentAction({ content: promptToUse });
      if (!filterResult.isSafe) {
        handleError(new Error(filterResult.reason), 'Your prompt was flagged as inappropriate. Please revise it.');
        setEditorState('idle');
        return;
      }

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
  
  async function handleGenerateMessages() {
    setMessageState('generating');
    try {
      const result = await generateMessagesAction({
        prompt: form.getValues('personalizedPrompt') || masterPrompt.prompt,
        occasion: masterPrompt.occasion,
      });
      setSuggestedMessages(result.messages);
      setMessageState('done');
    } catch (error) {
       handleError(error, 'Could not generate message suggestions.');
       setMessageState('error');
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
    setMessageState('idle');
    setRefinedPromptState('idle');
    setAnalysis(null);
    setRefinedPrompt(null);
    setFinalCardUri(null);
    setSuggestedMessages([]);
    setErrorMessage(null);
    setPersonalMessage('');
    form.reset();
  }

  const handleShare = async () => {
    if (!finalCardUri) return;
  
    toast({ title: "Preparing your card for sharing..." });
  
    try {
      // 1. Save card to Firestore and get the ID
      const { cardId } = await saveAndShareCardAction({
        prompt: form.getValues('personalizedPrompt'),
        masterPrompt: modifiedMasterPrompt,
        cardDataUrl: finalCardUri,
      });
  
      const magicLink = `${window.location.origin}/share/${cardId}`;
  
      // This is a simplified check. A more robust solution would check `navigator.canShare`.
      if (navigator.share) {
        // Convert data URI to blob to share file
        const response = await fetch(finalCardUri);
        const blob = await response.blob();
        const file = new File([blob], 'cardcraft-creation.png', { type: 'image/png' });
  
        await navigator.share({
          title: 'CardCraft AI Creation',
          text: `I made this card for you with CardCraft AI! Check it out: ${magicLink}`,
          files: [file],
        });
        toast({ title: "Shared successfully!" });
      } else {
        // Fallback for desktop or unsupported browsers
        await navigator.clipboard.writeText(magicLink);
        toast({
          title: "Magic Link Copied!",
          description: "Sharing isn't supported on this browser. The link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      const message = error instanceof Error ? error.message : "Could not prepare the card for sharing.";
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: message,
      });
    }
  };
  

  const isLoading = editorState === 'analyzing' || editorState === 'generating';
  const isRefining = refinedPromptState === 'generating';

  if (editorState === 'done' && finalCardUri) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Your Card is Ready!</CardTitle>
          <CardDescription>Download your creation or add a personal message.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full rounded-lg overflow-hidden border relative bg-muted" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
            <Image src={finalCardUri} alt="Generated AI card" fill className="object-contain" />

            {personalMessage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 flex items-end justify-center p-8">
                    <p className="text-white text-center text-xl font-body">{personalMessage}</p>
                </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a href={finalCardUri} download="cardcraft-creation.png">
              <Button className="w-full"><Download className="mr-2 h-4 w-4" /> Download</Button>
            </a>
            <Button variant="secondary" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share Card</Button>
            <Button variant="secondary"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className="w-full space-y-2">
                <Label htmlFor="personal-message">Add a Personal Message (optional)</Label>
                <Textarea
                  id="personal-message"
                  placeholder="Write your heartfelt message here..."
                  rows={3}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                />
            </div>

          {messageState !== 'done' && (
             <Button onClick={handleGenerateMessages} disabled={messageState === 'generating'} className="w-full" variant="outline">
              {messageState === 'generating' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquareQuote className="mr-2 h-4 w-4" />
              )}
              Get Message Ideas
            </Button>
          )}

           {messageState === 'done' && suggestedMessages.length > 0 && (
                <div className="space-y-2 w-full">
                    <Label>AI Message Suggestions (click to use)</Label>
                    <Carousel opts={{ align: "start", loop: false }} className="w-full">
                      <CarouselContent>
                        {suggestedMessages.map((msg, index) => (
                          <CarouselItem key={index} className="md:basis-1/2">
                            <div className="p-1">
                               <Card className="bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => {
                                 setPersonalMessage(msg);
                                 toast({ title: 'Message added!' });
                               }}>
                                <CardContent className="p-4 text-sm">
                                  <p>{msg}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                </div>
              )}
          
          <Button variant="outline" className="w-full mt-4" onClick={handleReset}>
            Create Another Card
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const RefinementSection = ({ title, options, value, onValueChange, categoryKey }: { title: string, options: {id: string, value: string, label: string}[], value: string | undefined, onValueChange: (value: string) => void, categoryKey: keyof typeof refinementOptions }) => (
    <Collapsible>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
            <span className="font-semibold">{title}</span>
            <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
            <RadioGroup value={value} onValueChange={onValueChange}>
                {options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.id} />
                        <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                ))}
            </RadioGroup>
            {value && <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => onValueChange(undefined as any)}><XCircle className="mr-1 h-4 w-4" />Clear</Button>}
        </CollapsibleContent>
    </Collapsible>
  );
  
  const AspectRatioSection = () => (
    <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
            <span className="font-semibold">Aspect Ratio</span>
            <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2">
            <RadioGroup value={aspectRatio} onValueChange={(val) => setAspectRatio(val as AspectRatioType)}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="9:16" id="ar-portrait" />
                    <Label htmlFor="ar-portrait">Portrait (Card)</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="16:9" id="ar-landscape" />
                    <Label htmlFor="ar-landscape">Landscape</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1:1" id="ar-square" />
                    <Label htmlFor="ar-square">Square</Label>
                </div>
            </RadioGroup>
        </CollapsibleContent>
    </Collapsible>
  );

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-4">
            <FormField
              control={form.control}
              name="personalizedPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Describe what you want to create</FormLabel>
                   <div className="text-xs p-2 rounded-md bg-muted/80 text-muted-foreground">
                    Try a structured prompt: [Occasion] card, [Subject], in the style of [Artistic Style], with a [Mood] atmosphere, featuring [Key Visuals], in a [Color Palette].
                   </div>
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
            
            {relevantMasterPrompts.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                        Or, start with a high-quality Master Prompt (click to use)
                    </Label>
                    <Carousel opts={{ align: "start", loop: false }} className="w-full">
                      <CarouselContent>
                        {relevantMasterPrompts.map((prompt) => (
                          <CarouselItem key={prompt.id} className="md:basis-1/2">
                            <div className="p-1">
                               <Card className="bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => form.setValue('personalizedPrompt', prompt.prompt)}>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm font-semibold">{prompt.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-xs">
                                  <p className="line-clamp-2">{prompt.prompt}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                </div>
            )}
            
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary"/> Prompt Refinements</CardTitle>
                    <CardDescription>Select options to generate a more detailed prompt suggestion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <AspectRatioSection />
                    <RefinementSection title="Artistic Medium" options={refinementOptions.artisticMedium} value={artisticMedium} onValueChange={setArtisticMedium} categoryKey="artisticMedium" />
                    <RefinementSection title="Color Palette" options={refinementOptions.colorPalette} value={colorPalette} onValueChange={setColorPalette} categoryKey="colorPalette" />
                    <RefinementSection title="Composition" options={refinementOptions.composition} value={composition} onValueChange={setComposition} categoryKey="composition" />
                    <RefinementSection title="Lighting" options={refinementOptions.lighting} value={lighting} onValueChange={setLighting} categoryKey="lighting" />
                    <RefinementSection title="Texture" options={refinementOptions.texture} value={texture} onValueChange={setTexture} categoryKey="texture" />
                </CardContent>
                <CardFooter>
                     <Button type="button" onClick={onGenerateRefinedPrompt} className="w-full" disabled={isRefining || !form.getValues('personalizedPrompt')}>
                        {isRefining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Refined Prompt
                    </Button>
                </CardFooter>
            </Card>

            {refinedPromptState === 'done' && refinedPrompt && (
              <Alert variant="default" className="bg-accent/20 border-accent/50">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="font-headline text-accent">Refined Prompt Suggestion</AlertTitle>
                <AlertDescription className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">Suggested Prompt:</p>
                    <blockquote className="border-l-2 pl-4 italic text-sm">{refinedPrompt.refinedPrompt}</blockquote>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => proceedToGeneration(refinedPrompt.refinedPrompt)}>
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                      Use Suggestion & Generate
                    </Button>
                     <Button variant="outline" onClick={() => form.setValue('personalizedPrompt', refinedPrompt.refinedPrompt)}>
                        Copy to Editor
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {editorState === 'needs_improvement' && analysis && (
              <Alert variant="default" className="bg-accent/20 border-accent/50">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="font-headline text-accent">Instant Prompt Suggestion</AlertTitle>
                <AlertDescription className="space-y-4">
                  <p>{analysis.summary}</p>
                  <div>
                    <p className="font-semibold mb-1">Suggested Prompt:</p>
                    <blockquote className="border-l-2 pl-4 italic text-sm">{analysis.improvedPrompt}</blockquote>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => proceedToGeneration(analysis.improvedPrompt)}>
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                      Use Suggestion & Generate
                    </Button>
                    <Button variant="outline" onClick={() => setEditorState('idle')}>
                      Let Me Edit
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            )}
            <div className="pt-4 space-y-2">
                <Button type="button" onClick={onAnalyze} className="w-full" variant="secondary" disabled={isLoading || editorState === 'needs_improvement'}>
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                        <><Lightbulb className="mr-2 h-4 w-4" /> Get Instant Suggestion</>
                    )}
                </Button>

                <Button type="submit" className="w-full" disabled={isLoading || editorState === 'needs_improvement'}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Card (Original Prompt)
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
