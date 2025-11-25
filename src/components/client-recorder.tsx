
'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ClientRecorderProps {
  baseImage: string;
  overlayVideo: string;
  soundtrack?: string;
  onRecordingComplete: (url: string) => void;
  onRecordingError: (error: string) => void;
}

export function ClientRecorder({
  baseImage,
  overlayVideo,
  soundtrack,
  onRecordingComplete,
  onRecordingError,
}: ClientRecorderProps) {
  const p5InstanceRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window === 'undefined' || !('p5' in window)) {
      onRecordingError("p5.js library is not loaded.");
      return;
    }

    const sketch = (p: any) => {
      let canvas: any;
      let img: any;
      let vid: any;
      let mediaRecorder: MediaRecorder;
      let audioContext: AudioContext;
      let audioStreamDestination: MediaStreamAudioDestinationNode;

      const recordedChunks: Blob[] = [];

      p.preload = () => {
        img = p.loadImage(baseImage);
        if (soundtrack) {
            audioRef.current = p.createAudio(soundtrack);
        }
      };

      p.setup = () => {
        canvas = p.createCanvas(1280, 720);
        if (containerRef.current) {
          canvas.parent(containerRef.current);
        }

        vid = p.createVideo(overlayVideo, () => {
            vid.loop();
            vid.volume(0);
            vid.hide();
        });

        p.frameRate(30);

        // -- Stream Setup --
        try {
            const canvasStream = (canvas.elt as HTMLCanvasElement).captureStream(30);
            let combinedStream: MediaStream;

            if (soundtrack && audioRef.current) {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const source = audioContext.createMediaElementSource(audioRef.current);
                audioStreamDestination = audioContext.createMediaStreamDestination();
                source.connect(audioStreamDestination);
                source.connect(audioContext.destination); // Play sound through speakers as well if needed

                const audioTrack = audioStreamDestination.stream.getAudioTracks()[0];
                canvasStream.addTrack(audioTrack);
                audioRef.current.play();
            }
            
            combinedStream = canvasStream;
            
            mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9,opus' });

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
            
            mediaRecorder.onerror = (event) => {
              console.error('MediaRecorder error:', event);
              onRecordingError('An error occurred during recording.');
              cleanup();
            };

            mediaRecorder.start();

            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 10000); // Record for 10 seconds

        } catch (e) {
          const errMessage = e instanceof Error ? e.message : 'Unknown recording error';
          console.error('Failed to start MediaRecorder:', e);
          onRecordingError(`Could not initialize recorder. ${errMessage}`);
          cleanup();
        }
      };

      p.draw = () => {
        p.background(0);
        p.image(img, 0, 0, p.width, p.height);
        p.blendMode(p.SCREEN);
        p.image(vid, 0, 0, p.width, p.height);
        p.blendMode(p.BLEND);
      };
      
      const cleanup = () => {
        if(vid) vid.remove();
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if(audioContext) audioContext.close();
        p.remove();
      };
    };

    p5InstanceRef.current = new (window as any).p5(sketch);

    return () => {
      // Cleanup when the component unmounts
      p5InstanceRef.current?.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative w-full aspect-video overflow-hidden rounded-lg border bg-black">
        <Image src={baseImage} layout="fill" objectFit="contain" alt="Scene preview" />
         <video
            key={overlayVideo}
            src={overlayVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-50"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-4">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-lg font-semibold">Recording Your Animation...</p>
            <p className="text-sm text-center">Please wait. This process happens in your browser and will take about 10 seconds.</p>
        </div>
      </div>
    </div>
  );
}
