
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
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null); // NEW: State to hold the MediaStream
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Effect 1: Request Camera Permission and get the MediaStream
  useEffect(() => {
    let currentLocalStream: MediaStream | null = null; // Local variable for cleanup

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
        currentLocalStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(currentLocalStream); // Store the stream in state
        setHasCameraPermission(true);
        // Do NOT assign srcObject here directly, as videoRef.current might still be null
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

    // Cleanup function: stop the camera tracks when component unmounts or effect re-runs
    return () => {
      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]); // Dependencies for this effect: only toast

  // Effect 2: Assign the stream to the video element once both are available
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      // The `autoplay` attribute should start playback, but `play()` can be added for robustness:
      // videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [videoRef.current, cameraStream]); // Dependencies: videoRef.current and cameraStream


  const takePhoto = () => {
    // Only attempt if cameraStream is active and video element is ready
    if (videoRef.current && canvasRef.current && cameraStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure videoWidth/videoHeight are not 0 before drawing
      if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn("Video stream dimensions are 0, cannot take photo yet.");
          toast({
              variant: 'destructive',
              title: 'Camera Not Ready',
              description: 'Please wait for the camera stream to load.',
          });
          return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg', 0.9); // Added quality for better compression
        sessionStorage.setItem('postcardImage', dataUri);
        router.push('/create/remix/postcard-editor');
      }
    } else {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Cannot take photo: Camera stream or video element not available.',
        });
    }
  };

  if (hasCameraPermission === null) {
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
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />

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
            {/* NEW: Overlay for when camera is allowed but stream hasn't loaded */}
            {hasCameraPermission === true && !cameraStream && (
                 <div className="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 text-white">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="ml-2">Loading camera stream...</p>
                </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <Button onClick={takePhoto} size="lg" disabled={!hasCameraPermission || !cameraStream}>
              <Camera className="mr-2 h-5 w-5" />
              Take Photo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
