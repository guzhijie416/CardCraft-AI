'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Camera } from 'lucide-react';

export default function CreatePostcardPage() {
  const creationOptions = [
    {
      title: 'Use Your Camera',
      description: 'Take a photo and use it as the background for your postcard. Perfect for capturing moments on the go.',
      icon: Camera,
      href: '/create/postcard/camera',
      linkText: 'Use Camera',
    },
    {
      title: 'Generate with AI',
      description: 'Don\'t have a photo? Describe the scene you want and our AI will create a stunning image for your postcard.',
      icon: Sparkles,
      href: '/create/ai/postcard',
      linkText: 'Start with AI',
    },
];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Create a Postcard</h1>
        <p className="text-muted-foreground mt-2 text-lg">How would you like to create your postcard?</p>
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
