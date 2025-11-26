
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand, ArrowLeft, Frame, Star, Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StampGenerator } from '@/components/ui/stamp-generator';


// --- Style Definitions ---
// Level 1: Frames
export type PostcardStyle = 'none' | 'classic' | 'polaroid' | 'postcard-back' | 'film-strip';
const frameStyles = [
  { id: 'classic' as PostcardStyle, name: 'The Classic', description: 'Simple, elegant, timeless. A clean border for a professional look.' },
  { id: 'polaroid' as PostcardStyle, name: 'Instant Memory', description: 'The iconic retro frame. Add a handwritten caption for a nostalgic touch.' },
  { id: 'postcard-back' as PostcardStyle, name: 'Flip & Write', description: 'A classic postcard back, with a message area and stamp.' },
  { id: 'film-strip' as PostcardStyle, name: 'Photo Reel', description: 'Frame your moment in a cinematic film strip.' },
];

// Level 2: Stickers (for future use)
const stickerStyles = [
    { id: 'stamp', name: 'Official Stamp', description: 'Make it official! Add a beautiful postage stamp and a custom postmark from your location.' },
    { id: 'greetings', name: 'Location Tags', description: 'Choose from beautiful, pre-designed "Greetings From..." titles to set the scene.' },
    { id: 'caption', name: 'Personal Touches', description: 'Add a heartfelt, handwritten phrase like "Wish you were here!" or "Best Day Ever."' }
]

// Level 3: Magic Styles (for future use)
const magicStyles = [
    { id: 'watercolor', name: "Artist's Sketch", description: 'Transform your photo into a beautiful watercolor painting.' },
    { id: 'vintage-film', name: "Retro Film", description: 'Give your photo the timeless, nostalgic look of a classic film camera.' },
    { id: 'golden-hour', name: "Golden Hour", description: 'Magically change the lighting to the warm glow of a perfect sunset.' },
]


export default function PostcardEditorPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<PostcardStyle>('classic');
  const [isClient, setIsClient] = useState(false);
  const [stampDataUri, setStampDataUri] = useState<string | null>(null);
  const [isStampDialogOpen, setIsStampDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedImage = sessionStorage.getItem('postcardImage');
    if (storedImage) {
      setPhotoDataUri(storedImage);
    } else {
      // If no image, redirect back to the start of the postcard flow
      if (isClient) {
        router.push('/create/remix/postcard');
      }
    }
  }, [isClient, router]);
  
  const handleNext = () => {
    sessionStorage.setItem('postcardStyle', selectedFrame);
    if (stampDataUri) {
      sessionStorage.setItem('postcardStamp', stampDataUri);
    } else {
      sessionStorage.removeItem('postcardStamp');
    }
    router.push('/create/remix/postcard-editor/finish');
  };

  const handleStampGenerated = (dataUri: string) => {
    setStampDataUri(dataUri);
    setIsStampDialogOpen(false);
  };

  if (!isClient || !photoDataUri) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4" />
        <p>Loading your photo...</p>
        <div className="mt-4">
            <Button variant="outline" asChild>
                <Link href="/create/remix/postcard">
                    Start Over
                </Link>
            </Button>
        </div>
      </div>
    );
  }
  
  const getFrameClassName = (frame: PostcardStyle) => {
    switch (frame) {
      case 'classic':
        return 'bg-white p-4 shadow-lg border';
      case 'polaroid':
        return 'bg-white p-4 pb-16 shadow-lg border';
      case 'film-strip':
        return 'bg-black p-2 border-4 border-black relative';
      case 'postcard-back':
        // This style will be handled differently in the preview
        return 'bg-[#F9F5E8] p-4 shadow-lg border';
      case 'none':
      default:
        return 'border';
    }
  };

  const Preview = () => {
    const frameClass = getFrameClassName(selectedFrame);

    if (selectedFrame === 'postcard-back') {
      return (
        <div className={cn("relative w-full max-w-md mx-auto transition-all duration-300", frameClass)}>
            <div className="relative w-full aspect-[4/3] bg-transparent flex justify-between gap-4">
                <div className='w-1/2'>
                    <div className='border-b border-black/30 pb-2 mb-2'>
                        <p className='text-xs text-black/50'>Write your message here...</p>
                    </div>
                     <div className='border-b border-black/30 pb-2 mb-2'></div>
                     <div className='border-b border-black/30 pb-2 mb-2'></div>
                </div>
                <div className='w-1/2 flex flex-col justify-between items-end border-l border-black/30 pl-4'>
                    <div className='w-16 h-16 border-2 border-dashed border-black/30 flex items-center justify-center text-xs text-black/30 relative'>
                       {stampDataUri ? (
                            <Image src={stampDataUri} alt="Generated stamp" fill className="object-contain p-1" />
                        ) : "Stamp"}
                    </div>
                    <div className='w-full text-right'>
                        <div className='border-b border-black/30 pb-1 mb-1'></div>
                        <div className='border-b border-black/30 pb-1 mb-1'></div>
                        <div className='border-b border-black/30 pb-1 mb-1'></div>
                    </div>
                </div>
            </div>
        </div>
      )
    }

    return (
        <div className={cn("relative w-full max-w-md mx-auto transition-all duration-300", frameClass)}>
            <div className="relative w-full aspect-[4/3] bg-muted">
                <Image
                    src={photoDataUri}
                    alt="Your captured postcard photo"
                    fill
                    className="object-cover"
                />
                 {stampDataUri && (
                    <Image src={stampDataUri} alt="Stamp" width={80} height={80} className="absolute top-2 right-2 opacity-90" />
                 )}
                 {selectedFrame === 'film-strip' && (
                    <div className="absolute -left-8 top-0 bottom-0 w-6 bg-black flex flex-col justify-around items-center">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-2 h-2 bg-white/50 rounded-sm" />)}
                    </div>
                 )}
                 {selectedFrame === 'film-strip' && (
                    <div className="absolute -right-8 top-0 bottom-0 w-6 bg-black flex flex-col justify-around items-center">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-2 h-2 bg-white/50 rounded-sm" />)}
                    </div>
                 )}
            </div>
             {selectedFrame === 'polaroid' && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="font-caveat text-xl text-black/80">A beautiful memory...</p>
                </div>
            )}
        </div>
    )
  };

  return (
    <div className="container mx-auto py-8">
       <div className="mb-4">
        <Button variant="ghost" asChild>
            <Link href="/create/remix/postcard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Options
            </Link>
        </Button>
       </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="sticky top-6">
            <Card>
                <CardHeader>
                    <CardTitle>Postcard Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Preview />
                </CardContent>
            </Card>
        </div>

        <div>
            <Tabs defaultValue="frames" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="frames"><Frame className="w-4 h-4 mr-2"/>Frames</TabsTrigger>
                    <TabsTrigger value="stickers"><Star className="w-4 h-4 mr-2"/>Stickers</TabsTrigger>
                    <TabsTrigger value="magic"><Sparkles className="w-4 h-4 mr-2"/>Magic Styles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="frames" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Level 1: Choose a Frame</CardTitle>
                            <CardDescription>Select a foundational style for your postcard.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {frameStyles.map((style) => (
                            <Card
                                key={style.id}
                                className={cn(
                                    "cursor-pointer hover:border-primary transition-all",
                                    selectedFrame === style.id && "border-primary ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedFrame(style.id)}
                            >
                                <CardHeader>
                                <CardTitle className="text-lg">{style.name}</CardTitle>
                                <CardDescription>{style.description}</CardDescription>
                                </CardHeader>
                            </Card>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stickers" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Level 2: Add Stickers</CardTitle>
                            <CardDescription>Add fun, decorative elements to add personality.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AlertDialog open={isStampDialogOpen} onOpenChange={setIsStampDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Card className="cursor-pointer hover:border-primary">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex justify-between items-center">Official Stamp</CardTitle>
                                            <CardDescription>Make it official! Add a beautiful postage stamp and a custom postmark from your location.</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Create Your Custom Postmark</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This stamp will be generated in your browser.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <StampGenerator onStampGenerated={handleStampGenerated} />
                                </AlertDialogContent>
                            </AlertDialog>
                             {stickerStyles.filter(s => s.id !== 'stamp').map((style) => (
                                <Card key={style.id} className="opacity-50 cursor-not-allowed">
                                    <CardHeader>
                                    <CardTitle className="text-lg flex justify-between items-center">{style.name} <Badge variant="outline">Coming Soon</Badge></CardTitle>
                                    <CardDescription>{style.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="magic" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Level 3: Apply Magic Styles</CardTitle>
                            <CardDescription>Use AI to transform your photo with powerful styles and effects.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             {magicStyles.map((style) => (
                                <Card key={style.id} className="opacity-50 cursor-not-allowed">
                                    <CardHeader>
                                    <CardTitle className="text-lg flex justify-between items-center">{style.name} <Badge variant="destructive">Premium</Badge></CardTitle>
                                    <CardDescription>{style.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             <div className="mt-6">
                <Button size="lg" className="w-full" onClick={handleNext}>
                    <Wand className="mr-2 h-4 w-4" />
                    Next: Add Text & Finish
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
