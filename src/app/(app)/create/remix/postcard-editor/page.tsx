
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Loader2, Sparkles, Wand, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export type PostcardStyle = 'none' | 'classic' | 'polaroid';

const postcardStyles = [
  { id: 'none' as PostcardStyle, name: 'No Style' },
  { id: 'classic' as PostcardStyle, name: 'Classic Border' },
  { id: 'polaroid' as PostcardStyle, name: 'Polaroid Frame' },
];

export default function PostcardEditorPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<PostcardStyle>('none');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedImage = sessionStorage.getItem('postcardImage');
    if (storedImage) {
      setPhotoDataUri(storedImage);
    } else {
      router.push('/create/remix/postcard');
    }
  }, [router]);
  
  const handleNext = () => {
    // Store the selected style and navigate to the final editor
    sessionStorage.setItem('postcardStyle', selectedStyle);
    router.push('/create/remix/postcard-editor/finish'); 
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
  
  const getFrameClassName = () => {
    switch (selectedStyle) {
      case 'classic':
        return 'bg-white p-4 shadow-lg';
      case 'polaroid':
        return 'bg-white p-4 pb-16 shadow-lg';
      case 'none':
      default:
        return '';
    }
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Style Your Postcard</CardTitle>
          <CardDescription>Choose a frame or style to apply to your photo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
            <div className={cn("relative w-full max-w-md transition-all duration-300", getFrameClassName())}>
              <div className="relative w-full aspect-[4/3] bg-muted">
                <Image
                    src={photoDataUri}
                    alt="Your captured postcard photo"
                    fill
                    className="object-cover"
                />
              </div>
            </div>

            <div>
                <Carousel opts={{ align: "start", loop: false }} className="w-full max-w-xs sm:max-w-sm">
                    <CarouselContent>
                        {postcardStyles.map((style) => (
                        <CarouselItem key={style.id} className="basis-1/2 md:basis-1/3">
                            <div className="p-1">
                                <Card
                                    className={cn(
                                        "cursor-pointer hover:border-primary",
                                        selectedStyle === style.id && "border-primary ring-2 ring-primary"
                                    )}
                                    onClick={() => setSelectedStyle(style.id)}
                                >
                                    <CardContent className="flex aspect-square items-center justify-center p-3 text-center">
                                    <span className="text-sm font-medium">{style.name}</span>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button size="lg" className="w-full" onClick={handleNext}>
                <Wand className="mr-2 h-4 w-4" />
                Next: Add Text & Stamps
            </Button>
             <Button size="lg" variant="secondary" className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Use AI Magic (Remix)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
