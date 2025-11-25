
'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ClientRecorderProps {
  baseImage: string;
  overlayVideo: string;
  onRecordingComplete: (url: string) => void;
  onRecordingError: (error: string) => void;
}

export function ClientRecorder({
  baseImage,
  overlayVideo,
  onRecordingComplete,
  onRecordingError,
}: ClientRecorderProps) {
  const p5InstanceRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRecordingStarted = useRef(false);

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window === 'undefined' || !(window as any).p5) {
      onRecordingError("p5.js library is not loaded.");
      return;
    }
    
    // Prevent re-initialization on re-renders
    if (p5InstanceRef.current) {
        return;
    }

    const sketch = (p: any) => {
      let canvas: any;
      let img: any;
      let vid: any;
      let mediaRecorder: MediaRecorder;
      const recordedChunks: Blob[] = [];

      // Cleanup function to be called on success, error, or unmount
      const cleanup = () => {
        if (vid) vid.remove();
        if (p) p.remove();
        p5InstanceRef.current = null;
      };

      p.preload = () => {
        try {
          img = p.loadImage(baseImage);
          vid = p.createVideo(overlayVideo);
        } catch (e) {
          const errMessage = e instanceof Error ? e.message : 'Failed to load media assets.';
          onRecordingError(`Preload failed: ${errMessage}`);
          cleanup();
        }
      };

      p.setup = () => {
        // If preload failed, the component might try to setup.
        if (!img || !vid) {
            return;
        }

        canvas = p.createCanvas(1280, 720);
        if (containerRef.current) {
          canvas.parent(containerRef.current);
        }

        vid.loop();
        vid.volume(0);
        vid.hide();

        p.frameRate(30);

        if (isRecordingStarted.current) return;
        isRecordingStarted.current = true;

        try {
            const stream = (canvas.elt as HTMLCanvasElement).captureStream(30);
            
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                recordedChunks.push(event.data);
              }
            };

            mediaRecorder.onstop = () => {
              const blob = new Blob(recordedChunks, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              onRecordingComplete(url);
              cleanup();
            };
            
            mediaRecorder.onerror = (event: any) => {
              console.error('MediaRecorder error:', event);
              onRecordingError('An error occurred during recording.');
              cleanup();
            };

            mediaRecorder.start();

            // Record for 10 seconds, then stop
            setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 10000);

        } catch (e) {
          const errMessage = e instanceof Error ? e.message : 'Unknown recording error';
          console.error('Failed to start MediaRecorder:', e);
          onRecordingError(`Could not initialize recorder. ${errMessage}`);
          cleanup();
        }
      };

      p.draw = () => {
        // Don't draw if setup failed
        if (!img || !vid) {
            p.background(0); // Draw a black background to indicate failure
            return;
        };
        p.background(0);
        p.image(img, 0, 0, p.width, p.height);
        p.blendMode(p.SCREEN);
        p.image(vid, 0, 0, p.width, p.height);
        p.blendMode(p.BLEND);
      };
    };

    p5InstanceRef.current = new (window as any).p5(sketch);

    // Return a cleanup function for when the component unmounts
    return () => {
        if (p5InstanceRef.current) {
            p5InstanceRef.current.remove();
            p5InstanceRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative w-full aspect-video overflow-hidden rounded-lg border bg-black">
        {/* The p5 canvas will be inserted here */}
         <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-4">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-lg font-semibold">Recording Your Animation...</p>
            <p className="text-sm text-center">Please wait. This process happens in your browser and will take about 10 seconds.</p>
        </div>
      </div>
    </div>
  );
}
