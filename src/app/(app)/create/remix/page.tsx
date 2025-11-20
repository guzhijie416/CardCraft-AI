'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function CreateRemixPage() {
  const creationOptions = [
    {
      title: 'Postcard from Camera',
      description: 'Take a photo and use it as the background for a fun, AI-enhanced postcard.',
      icon: Camera,
      href: '/create/remix/camera',
      linkText: 'Use Camera',
    },
    {
      title: 'Remix with Style',
      description: 'Upload an image to transfer its artistic style to a new AI-generated creation.',
      icon: ImageIcon,
      href: '/create/remix/style', // <-- Updated Link
      linkText: 'Upload Style Image',
    },
];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Photo Remix</h1>
        <p className="text-muted-foreground mt-2 text-lg">Use your photos to create something amazing.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {creationOptions.map((option) => (
          <Link href={option.href} key={option.title} className="block">
            <Card className="h-full text-center p-8 flex flex-col items-center justify-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                  <option.icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">{option.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{option.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
