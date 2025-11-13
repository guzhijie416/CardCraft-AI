
'use client';

import { notFound } from 'next/navigation';
import { templates, placeholderImages, suggestedMessages } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function TemplateEditorPage({ params }: { params: { templateId: string } }) {
  const template = templates.find(t => t.id === params.templateId);
  const [message, setMessage] = useState('');

  if (!template) {
    notFound();
  }

  const image = placeholderImages.find(p => p.id === template.imageId);
  const relevantMessages = suggestedMessages.filter(m => m.occasion === template.occasion);

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Customize Your Card</CardTitle>
              <CardDescription>Add a personal message to the '{template.name}' template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your heartfelt message here..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {relevantMessages.length > 0 && (
                <div className="space-y-2">
                    <Label>Need inspiration? Click a suggestion.</Label>
                    <Carousel opts={{ align: "start", loop: true }} className="w-full">
                      <CarouselContent>
                        {relevantMessages.map((suggestion) => (
                          <CarouselItem key={suggestion.id} className="basis-full">
                            <div className="p-1">
                               <Card className="bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => setMessage(suggestion.message)}>
                                <CardContent className="p-4 text-sm">
                                  <p>{suggestion.message}</p>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="ml-12" />
                      <CarouselNext className="mr-12"/>
                    </Carousel>
                </div>
              )}

              <Button className="w-full">Save & Preview</Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center relative">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    width={400}
                    height={500}
                    data-ai-hint={image.imageHint}
                    className="w-full h-full object-cover"
                  />
                )}
                {message && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-8">
                        <p className="text-white text-center text-lg font-body">{message}</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
