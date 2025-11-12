import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { masterPrompts, occasions, placeholderImages } from '@/lib/data';
import type { Occasion } from '@/lib/data';
import { notFound } from 'next/navigation';

export default function MasterPromptSelectionPage({ params }: { params: { occasion: Occasion['id'] } }) {
  const { occasion } = params;
  const occasionDetails = occasions.find(o => o.id === occasion);
  const filteredPrompts = masterPrompts.filter(p => p.occasion === occasion);

  if (!occasionDetails) {
    notFound();
  }

  if (occasion === 'postcard') {
    // This case is now handled by /create/postcard page.
    // However, to avoid breaking links if someone lands here directly,
    // we can redirect or show a specific message.
    // For now, we can show the postcard master prompt directly.
     const postcardMasterPrompt = masterPrompts.find(p => p.id === 'postcard-mp-1');
     if (!postcardMasterPrompt) notFound();
     
     return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">Create an AI Postcard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Describe the postcard you want to create.</p>
            </div>
            <div className="flex justify-center">
                 <Card key={postcardMasterPrompt.id} className="overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col max-w-sm">
                    <CardHeader>
                        <CardTitle className="font-headline">{postcardMasterPrompt.name}</CardTitle>
                        <CardDescription className="text-sm">{postcardMasterPrompt.prompt}</CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto">
                    <Button asChild className="w-full">
                        <Link href={`/create/ai/editor/${postcardMasterPrompt.id}`}>Select & Personalize</Link>
                    </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
     )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Choose an AI Style</h1>
        <p className="text-muted-foreground mt-2 text-lg">Select a master style to guide the AI for your {occasionDetails.name} card.</p>
      </div>

      {filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(prompt => {
            const image = placeholderImages.find(p => p.id === prompt.imageId);
            return (
              <Card key={prompt.id} className="overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
                {image && (
                  <CardContent className="p-0 aspect-video bg-muted">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      width={400}
                      height={250}
                      data-ai-hint={image.imageHint}
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                )}
                <CardHeader>
                    <CardTitle className="font-headline">{prompt.name}</CardTitle>
                    <CardDescription className="text-sm">{prompt.prompt}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/create/ai/editor/${prompt.id}`}>Select & Personalize</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No AI styles available for this occasion yet.</p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/create/ai">Back to occasions</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
