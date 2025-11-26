
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { PostcardStyle } from '../page';

// Dummy stamp data
const stamps = [
  { id: 'stamp-1', url: 'https://picsum.photos/seed/stamp1/100/100', alt: 'Flower Stamp' },
  { id: 'stamp-2', url: 'https://picsum.photos/seed/stamp2/100/100', alt: 'Bird Stamp' },
  { id: 'stamp-3', url: 'https://picsum.photos/seed/stamp3/100/100', alt: 'Mountain Stamp' },
];

export default function PostcardFinishPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [style, setStyle] = useState<PostcardStyle>('none');
  const [message, setMessage] = useState('');
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const storedImage = sessionStorage.getItem('postcardImage');
    const storedStyle = sessionStorage.getItem('postcardStyle') as PostcardStyle | null;
    
    if (storedImage && storedStyle) {
      setPhotoDataUri(storedImage);
      setStyle(storedStyle);
    } else {
      // Redirect if data is missing
      router.push('/create/remix/postcard');
    }
  }, [router]);

  if (!isClient || !photoDataUri) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4" />
        <p>Loading your postcard...</p>
      </div>
    );
  }

  const getFrameClassName = () => {
    switch (style) {
      case 'classic':
        return 'bg-white p-4 shadow-lg';
      case 'polaroid':
        return 'bg-white p-4 pb-16 shadow-lg relative';
      case 'none':
      default:
        return 'relative';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="ghost" asChild>
            <Link href="/create/remix/postcard-editor">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Styles
            </Link>
        </Button>
       </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Final Touches</CardTitle>
            <CardDescription>Add a message and a stamp to complete your postcard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea 
                id="message" 
                placeholder="Wishing you were here..." 
                rows={4} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Choose a Stamp</Label>
              <div className="flex gap-2">
                {stamps.map(stamp => (
                  <button 
                    key={stamp.id}
                    className={cn(
                        "rounded-md overflow-hidden border-2 transition-all",
                        selectedStamp === stamp.id ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                    )}
                    onClick={() => setSelectedStamp(stamp.id)}
                  >
                    <Image src={stamp.url} alt={stamp.alt} width={60} height={60} className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download</Button>
            <Button><Send className="mr-2 h-4 w-4" /> Share Postcard</Button>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("w-full max-w-md mx-auto transition-all duration-300", getFrameClassName())}>
                    <div className="relative w-full aspect-[4/3] bg-muted">
                        <Image
                            src={photoDataUri}
                            alt="Your postcard photo"
                            fill
                            className="object-cover"
                        />
                        {/* Message Overlay */}
                        {message && style === 'polaroid' && (
                            <div className="absolute bottom-4 left-4 right-4 text-center">
                                <p className="font-caveat text-xl text-black">{message}</p>
                            </div>
                        )}
                         {message && style !== 'polaroid' && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
                               <p className="text-white font-body text-lg text-center shadow-lg">{message}</p>
                            </div>
                         )}

                        {/* Stamp Overlay */}
                        {selectedStamp && (
                            <Image 
                                src={stamps.find(s => s.id === selectedStamp)!.url}
                                alt={stamps.find(s => s.id === selectedStamp)!.alt}
                                width={50}
                                height={50}
                                className="absolute top-2 right-2 border-2 border-white shadow-md"
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
