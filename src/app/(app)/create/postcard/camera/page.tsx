'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AiCardEditor } from '@/components/ai-card-editor';
import { masterPrompts } from '@/lib/data';

export default function PostcardCameraPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isClient, toast]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPhotoDataUri(dataUri);
      }
    }
  };
  
  const postcardMasterPrompt = masterPrompts.find(p => p.id === 'postcard-mp-1');

  if (!isClient || hasCameraPermission === null) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading camera...</p>
      </div>
    );
  }
  
  if (postcardMasterPrompt && photoDataUri) {
     return (
       <div className="container mx-auto py-8">
         <AiCardEditor
           masterPrompt={postcardMasterPrompt}
           photoDataUri={photoDataUri}
         />
       </div>
     );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Create a Postcard</CardTitle>
          <CardDescription>Take a photo to use as the background for your AI-generated postcard.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser to use this feature.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="mt-4 flex justify-center">
            <Button onClick={takePhoto} size="lg" disabled={!hasCameraPermission}>
              <Camera className="mr-2 h-5 w-5" />
              Take Photo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
