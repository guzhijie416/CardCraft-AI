'use client';

import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { Button } from './ui/button';
import { Loader2, Sparkle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ClientRecorderProps {
  baseImage: string;
  overlayVideo: string;
  soundtrack?: string;
  onRecordingStart: () => void;
  onRecordingComplete: (url: string) => void;
  onRecordingError: (error: string) => void;
}

export function ClientRecorder({
  baseImage,
  overlayVideo,
  soundtrack,
  onRecordingStart,
  onRecordingComplete,
  onRecordingError,
}: ClientRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sketchRef = useRef<p5 | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup function to remove the p5 instance when the component unmounts
    return () => {
      sketchRef.current?.remove();
    };
  }, []);

  const startRecording = () => {
    onRecordingStart();
    setIsRecording(true);
    setError(null);

    const sketch = (p: p5) => {
      let canvas: p5.Renderer;
      let img: p5.Image;
      let vid: p5.MediaElement;
      let song: p5.SoundFile | undefined;
      const recordingDuration = 10000; // 10 seconds in milliseconds
      let startTime: number;

      p.preload = () => {
        img = p.loadImage(baseImage);
        if (soundtrack) {
          // @ts-ignore
          p.soundFormats('mp3');
          // @ts-ignore
          song = p.loadSound(soundtrack);
        }
      };

      p.setup = () => {
        canvas = p.createCanvas(1280, 720); // 16:9 aspect ratio
        vid = p.createVideo(overlayVideo, () => {
          vid.loop();
          vid.volume(0);
          vid.hide();
        });
        p.frameRate(30);

        try {
          const stream = (canvas.elt as HTMLCanvasElement).captureStream(30);
          
          if (song) {
             const audioContext = p.getAudioContext();
             const audioDestination = audioContext.createMediaStreamDestination();
             // @ts-ignore
             song.connect(audioDestination);
             const audioTracks = audioDestination.stream.getAudioTracks();
             if (audioTracks.length > 0) {
                 stream.addTrack(audioTracks[0]);
             }
          }

          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
          recordedChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            onRecordingComplete(url);
            setIsRecording(false);
            p.remove(); // Clean up the p5 sketch
          };
          
          mediaRecorderRef.current.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            setError('An error occurred during recording.');
            onRecordingError('An error occurred during recording.');
            setIsRecording(false);
          };

          mediaRecorderRef.current.start();
          if (song) {
            // @ts-ignore
            song.play();
          }
          startTime = p.millis();

        } catch (e) {
            const errMessage = e instanceof Error ? e.message : 'Unknown recording error';
            console.error('Failed to start MediaRecorder:', e);
            setError(`Could not initialize recorder. ${errMessage}`);
            onRecordingError(`Could not initialize recorder. ${errMessage}`);
            setIsRecording(false);
        }
      };

      p.draw = () => {
        p.background(0);
        p.image(img, 0, 0, p.width, p.height);

        // Overlay video
        p.blendMode(p.SCREEN); // Use SCREEN or ADD for better blending of light effects
        p.image(vid, 0, 0, p.width, p.height);
        p.blendMode(p.BLEND); // Reset blend mode

        // Stop recording after duration
        if (p.millis() - startTime > recordingDuration) {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            if(song){
                // @ts-ignore
                song.stop();
            }
          }
        }
      };
    };

    // Initialize p5.js
    sketchRef.current = new p5(sketch);
  };

  return (
    <div className="space-y-4">
        <div className="relative w-full aspect-video overflow-hidden rounded-lg border bg-black">
             <Image src={baseImage} layout="fill" objectFit="contain" alt="Scene preview"/>
            <video
                key={overlayVideo}
                src={overlayVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
            />
            {isRecording && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Recording in progress...</p>
                    </div>
                </div>
            )}
        </div>
        <Button onClick={startRecording} disabled={isRecording} className="w-full" size="lg">
            {isRecording ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkle className="mr-2 h-4 w-4" />
            )}
            Export Video
        </Button>
        {error && (
             <Alert variant="destructive" className="mt-4">
                <AlertTitle>Export Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
    </div>
  );
}
