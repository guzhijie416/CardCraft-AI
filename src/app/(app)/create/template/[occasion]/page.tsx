import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { templates, occasions, placeholderImages } from '@/lib/data';
import type { Occasion } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function TemplateSelectionPage({ params }: { params: { occasion: Occasion['id'] } }) {
  const { occasion } = params;
  const occasionDetails = occasions.find(o => o.id === occasion);
  const filteredTemplates = templates.filter(t => t.occasion === occasion);

  if (!occasionDetails) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Choose a {occasionDetails.name} Template</h1>
        <p className="text-muted-foreground mt-2 text-lg">Select a design to get started.</p>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTemplates.map(template => {
            const image = placeholderImages.find(p => p.id === template.imageId);
            return (
              <Card key={template.id} className="overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardContent className="p-0 aspect-[4/5] bg-muted">
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
                </CardContent>
                <CardFooter className="p-4 flex flex-col items-start">
                  <h3 className="font-semibold font-headline">{template.name}</h3>
                  <Button asChild className="mt-2 w-full">
                    <Link href={`/create/ai/${template.occasion}`}>Use AI Instead</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No templates available for this occasion yet.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/create">Back to creation</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
