import { notFound } from 'next/navigation';
import { templates, placeholderImages } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function TemplateEditorPage({ params }: { params: { templateId: string } }) {
  const template = templates.find(t => t.id === params.templateId);

  if (!template) {
    notFound();
  }

  const image = placeholderImages.find(p => p.id === template.imageId);

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
                <Textarea id="message" placeholder="Write your heartfelt message here..." rows={8} />
              </div>
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
              <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
