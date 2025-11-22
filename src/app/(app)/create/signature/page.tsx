
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signatureCollections } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function SignatureStudioPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Signature Studio</h1>
        <p className="text-muted-foreground mt-2 text-lg">Create with confidence. Start with a masterpiece from our curated collections.</p>
      </div>

      <div className="space-y-12">
        {signatureCollections.map((collection) => (
          <section key={collection.id}>
            <div className="mb-6">
              <h2 className="text-3xl font-bold font-headline">{collection.name}</h2>
              <p className="text-muted-foreground mt-1">{collection.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.templates.slice(0, 3).map(template => (
                <Link href={`/create/signature/editor/${template.id}`} key={template.id} className="block">
                    <Card className="h-full overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        <CardContent className="p-0 aspect-video bg-muted relative">
                           {/* Placeholder for image */}
                           <div className="w-full h-full bg-secondary"></div>
                        </CardContent>
                        <CardHeader>
                            <CardTitle className="font-headline">{template.title}</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
              ))}
            </div>
             {collection.templates.length > 3 && (
                <div className="text-center mt-8">
                    <Button asChild variant="outline">
                        <Link href={`/create/signature/${collection.id}`}>
                            View Full Collection <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
             )}
          </section>
        ))}
      </div>
    </div>
  );
}
