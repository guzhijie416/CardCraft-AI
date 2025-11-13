'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { templates, allOccasions, placeholderImages } from '@/lib/data';
import type { Occasion } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function TemplateSelectionPage({ params }: { params: { occasion: Occasion['id'] } }) {
  const [visibleCount, setVisibleCount] = useState(10);
  const { occasion } = params;
  const occasionDetails = allOccasions.find(o => o.id === occasion);
  const filteredTemplates = templates.filter(t => t.occasion === occasion);

  if (!occasionDetails) {
    notFound();
  }

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 10);
  };
  
  const visibleTemplates = filteredTemplates.slice(0, visibleCount);

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Choose a {occasionDetails.name} Template</h1>
        <p className="text-muted-foreground mt-2 text-lg">Select a design to get started.</p>
      </div>

      {filteredTemplates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {visibleTemplates.map(template => {
              const image = placeholderImages.find(p => p.id === template.imageId);
              return (
                <Card key={template.id} className="overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <CardContent className="p-0 aspect-[4/5] bg-muted relative">
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
                     <div className="absolute inset-0 ring-1 ring-inset ring-black/10"></div>
                  </CardContent>
                  <CardHeader className="p-4">
                    <CardTitle className="font-headline text-lg truncate">{template.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/editor/template/${template.id}`}>Customize</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {visibleCount < filteredTemplates.length && (
            <div className="text-center mt-12">
              <Button onClick={handleShowMore} size="lg">
                Show More
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No templates available for this category yet.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/create/template">Back to categories</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
