
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signatureCollections, placeholderImages } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Gem } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SignatureCollectionPage({ params }: { params: { collectionId: string } }) {
  const collection = signatureCollections.find(c => c.id === params.collectionId);

  if (!collection) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-12">
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/create" className="hover:underline">Create</Link>
          <span className="mx-2">/</span>
          <Link href="/create/signature" className="hover:underline">Signature Studio</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-foreground">{collection.name}</span>
        </div>
        <h1 className="text-4xl font-bold font-headline">{collection.name}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{collection.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.templates.map(template => {
          const image = placeholderImages.find(p => p.id === template.imageId);
          return (
            <Link href={`/create/signature/editor/${template.id}`} key={template.id} className="block group">
              <Card className="h-full overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
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
                  {template.isPremium && (
                      <Badge variant="destructive" className="absolute top-2 right-2 flex items-center gap-1">
                          <Gem className="h-3 w-3"/>
                          Pro
                      </Badge>
                  )}
                </CardContent>
                <CardHeader>
                    <CardTitle className="font-headline">{template.title}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
