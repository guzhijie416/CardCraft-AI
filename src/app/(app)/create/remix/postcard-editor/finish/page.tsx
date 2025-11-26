
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';


export default function PostcardFinishPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [style, setStyle] = useState<PostcardStyle>('none');
  const [message, setMessage] = useState('');
  const [stampDataUri, setStampDataUri] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const storedImage = sessionStorage.getItem('postcardImage');
    const storedStyle = sessionStorage.getItem('postcardStyle') as PostcardStyle | null;
    const storedStamp = sessionStorage.getItem('postcardStamp');
    
    if (storedImage && storedStyle) {
      setPhotoDataUri(storedImage);
      setStyle(storedStyle);
      if (storedStamp) {
        setStampDataUri(storedStamp);
      }
    } else {
      // Redirect if data is missing
      router.push('/create/remix/postcard');
    }
  }, [router]);

  const handleDownload = useCallback(() => {
    if (!previewRef.current) {
        toast({
            variant: 'destructive',
            title: 'Download Error',
            description: 'Could not find the postcard preview to download.',
        });
        return;
    }
    
    setIsDownloading(true);

    toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 }) // pixelRatio for higher quality
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'cardcraft-postcard.png';
        link.href = dataUrl;
        link.click();
        setIsDownloading(false);
        toast({
            title: 'Download Started!',
            description: 'Your postcard is being downloaded.',
        })
      })
      .catch((err) => {
        console.error(err);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Sorry, there was an error creating the image file.',
        });
        setIsDownloading(false);
      });
  }, [previewRef, toast]);


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
        return 'bg-white p-4 pb-20 shadow-lg relative'; // Increased bottom padding
      case 'postcard-back':
        return 'bg-[#F9F5E8] p-4 shadow-lg';
      case 'film-strip':
        return 'bg-black p-2 border-4 border-black relative';
      case 'none':
      default:
        return 'relative';
    }
  };
  
  const frameClass = getFrameClassName();

  const PostcardPreview = () => {

    if (style === 'postcard-back') {
        return (
            <div ref={previewRef} className={cn("w-full max-w-md mx-auto transition-all duration-300", frameClass)}>
                <div className="relative w-full aspect-[4/3] bg-transparent flex justify-between gap-4">
                    <div className='w-1/2'>
                        <div className="h-full p-2 font-caveat text-xl">
                            {message || 'Write your message here...'}
                        </div>
                    </div>
                    <div className='w-1/2 flex flex-col justify-between items-end border-l border-black/30 pl-4 py-2'>
                        <div className='w-20 h-20 border border-black/30 flex items-center justify-center text-xs text-black/30 relative'>
                            {stampDataUri ? <Image src={stampDataUri} alt="stamp" fill className="object-contain p-1" /> : 'Stamp'}
                        </div>
                        <div className='w-full text-right text-xs text-black/60'>
                           <p>Address line 1</p>
                           <p>Address line 2</p>
                           <p>City, Postal</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div ref={previewRef} className={cn("w-full max-w-md mx-auto transition-all duration-300", frameClass)}>
            <div className="relative w-full aspect-[4/3] bg-muted">
                <Image
                    src={photoDataUri}
                    alt="Your postcard photo"
                    fill
                    className="object-cover"
                />
                {/* Polaroid-style caption */}
                {message && style === 'polaroid' && (
                    <div className="absolute -bottom-16 left-0 right-0 text-center px-4">
                        <p className="font-caveat text-2xl text-black">{message}</p>
                    </div>
                )}
                 {/* Centered message for 'classic' and other styles */}
                 {message && style !== 'polaroid' && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
                       <p className="font-body text-lg text-center shadow-lg text-white">{message}</p>
                    </div>
                 )}

                {/* Stamp Overlay */}
                {stampDataUri && style !== 'postcard-back' && (
                    <Image 
                        src={stampDataUri}
                        alt="Postmark stamp"
                        width={80}
                        height={80}
                        className="absolute top-2 right-2"
                    />
                )}
            </div>
        </div>
    )
  }


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
            <CardDescription>Add a message to complete your postcard.</CardDescription>
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
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download
            </Button>
            <Button><Send className="mr-2 h-4 w-4" /> Share Postcard</Button>
          </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <PostcardPreview />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
