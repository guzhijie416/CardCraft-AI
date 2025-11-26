
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function PostcardCameraPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This component relies heavily on browser APIs, so we ensure it only runs on the client.
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let stream: MediaStream | null = null;

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
        // Request access to the camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        // Assign the stream to the video element's srcObject
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

    // Cleanup function: This will be called when the component unmounts.
    return () => {
      if (stream) {
        // Stop all tracks in the stream to turn off the camera
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // The dependency array ensures this effect runs when isClient becomes true.
  // It is the correct place to handle hardware access.
  }, [isClient, toast]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the video's intrinsic size to ensure a correct capture
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame onto the hidden canvas
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Convert the canvas content to a Data URL (JPEG format)
        const dataUri = canvas.toDataURL('image/jpeg');
        
        // Store the image in session storage to pass to the next page
        sessionStorage.setItem('postcardImage', dataUri);
        
        // Navigate to the editor
        router.push('/create/remix/postcard-editor');
      }
    }
  };

  // While waiting for client-side hydration and camera permission
  if (!isClient || hasCameraPermission === null) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-2 text-muted-foreground">Requesting camera permission...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Create a Postcard</CardTitle>
          <CardDescription>Take a photo to turn into a custom postcard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full rounded-md overflow-hidden border bg-muted">
            {/* The video element that will display the camera feed */}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            
            {/* A hidden canvas for capturing the photo */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Show an error message if camera access was denied */}
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permission.
                    </AlertDescription>
                    </Alert>
                </div>
            )}
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
