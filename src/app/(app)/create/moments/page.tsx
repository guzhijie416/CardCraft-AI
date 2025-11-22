
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { momentCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/data';

export default function MomentsStudioPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Moments Studio</h1>
        <p className="text-muted-foreground mt-2 text-lg">Don't just share your day. Share the feeling. Select a moment to get started.</p>
      </div>

      <div className="space-y-12">
        {momentCategories.map((collection) => (
          <section key={collection.id}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold font-headline">{collection.name}</h2>
              <p className="text-muted-foreground mt-1">{collection.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.templates.slice(0, 3).map(template => {
                const image = placeholderImages.find(p => p.id === template.imageId);
                return (
                 <Link href={`/create/moments/editor/${template.id}`} key={template.id} className="block">
                    <Card className="h-full overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        <CardContent className="p-0 aspect-video bg-muted relative">
                           {image && (
                                <Image
                                    src={image.imageUrl}
                                    alt={template.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-full object-cover"
                                />
                           )}
                        </CardContent>
                        <CardHeader>
                            <CardTitle className="font-headline">{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                )
            })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
