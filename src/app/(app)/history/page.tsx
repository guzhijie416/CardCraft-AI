import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { historyItems, placeholderImages } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Download, Repeat } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Creation History</h1>
        <p className="text-muted-foreground">A gallery of your past AI-generated cards.</p>
      </div>

      {historyItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {historyItems.map((item) => {
            const image = placeholderImages.find(p => p.id === item.imageId);
            return (
              <Card key={item.id} className="overflow-hidden flex flex-col">
                {image && (
                  <CardContent className="p-0 aspect-[4/5] bg-muted">
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      width={400}
                      height={500}
                      data-ai-hint={image.imageHint}
                      className="w-full h-full object-cover"
                    />
                  </CardContent>
                )}
                <CardHeader className="pb-2">
                    <CardDescription className="text-xs">{item.createdAt}</CardDescription>
                    <CardTitle className="text-base font-normal line-clamp-2">"{item.prompt}"</CardTitle>
                </CardHeader>
                <CardFooter className="mt-auto grid grid-cols-2 gap-2">
                    <Button variant="outline"><Repeat className="mr-2 h-4 w-4" /> Re-create</Button>
                    <Button><Download className="mr-2 h-4 w-4" /> Download</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No history yet!</h2>
          <p className="text-muted-foreground mt-2">Start creating with AI to see your history here.</p>
        </div>
      )}
    </div>
  );
}
