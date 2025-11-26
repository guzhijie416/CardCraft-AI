
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

interface StampGeneratorProps {
  onStampGenerated: (dataUri: string) => void;
}

export function StampGenerator({ onStampGenerated }: StampGeneratorProps) {
  const [city, setCity] = useState('CardCraft');
  const [date, setDate] = useState('JUL 26 2024');
  const [isGenerating, setIsGenerating] = useState(false);
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);

    // p5.js is loaded via a Script tag in the root layout
    if (!(window as any).p5) {
      alert("p5.js is not loaded!");
      setIsGenerating(false);
      return;
    }

    const sketch = (p: any) => {
      let font: any;
      let circleImg: any;
      const canvasSize = 300;

      p.preload = () => {
        // Using a built-in font that looks stamp-like to avoid ttf loading complexities
        font = p.loadFont('https://fonts.gstatic.com/s/oswald/v40/TK3_WkUHHAIjg75cFRf3bXL8LICs1_Fv.woff2');
        // A placeholder for the circle, ideally this would be a transparent PNG
        circleImg = p.loadImage('https://picsum.photos/seed/postmark/300/300'); 
      };

      p.setup = () => {
        const canvas = p.createCanvas(canvasSize, canvasSize);
        p.background(255); // White background

        // Draw a placeholder circle if the image fails, or use it for shape
        p.stroke(0, 50); // transparent black
        p.noFill();
        p.strokeWeight(12);
        p.circle(p.width / 2, p.height / 2, 280);
        p.circle(p.width / 2, p.height / 2, 180);


        // --- Text Drawing Logic ---
        p.textFont(font);
        p.fill(51, 51, 51); // #333 dark gray
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);

        // Draw straight date text
        p.textSize(24);
        p.text(date.toUpperCase(), p.width / 2, p.height / 2);

        // Draw curved city text
        p.textSize(30);
        const radius = 110;
        const cityText = city.toUpperCase();
        const angleStep = (p.PI * 0.8) / (cityText.length - 1);
        const startAngle = -p.PI * 0.9;
        
        p.push();
        p.translate(p.width / 2, p.height / 2);
        for (let i = 0; i < cityText.length; i++) {
          const angle = startAngle + i * angleStep;
          p.push();
          p.rotate(angle);
          p.text(cityText[i], 0, -radius);
          p.pop();
        }
        p.pop();
        
        // --- End Drawing Logic ---
        
        // Convert canvas to data URI and pass it to parent
        const dataUri = canvas.elt.toDataURL('image/png');
        onStampGenerated(dataUri);
        setIsGenerating(false);

        // Clean up the p5 instance
        p.remove();
        p5InstanceRef.current = null;
      };
    };

    // Only create a new instance if one doesn't exist
    if (!p5InstanceRef.current) {
        p5InstanceRef.current = new (window as any).p5(sketch, sketchRef.current!);
    }
  };

  return (
    <>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            maxLength={20} 
            placeholder="e.g., Paris"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            placeholder="e.g., JAN 01 2025"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate Stamp
        </Button>
      </CardFooter>
      {/* Hidden div for p5.js to attach the canvas to */}
      <div ref={sketchRef} className="hidden"></div>
    </>
  );
}
