'use client';

import { useEffect, useState } from 'react';
import { notFound, usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

type SharedCard = {
  id: string;
  prompt: string;
  masterPrompt: string;
  cardDataUrl: string;
  createdAt: { seconds: number; nanoseconds: number };
};

export default function SharePage({ params }: { params: { cardId: string } }) {
  const { cardId } = params;
  const firestore = useFirestore();
  const [card, setCard] = useState<SharedCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // This is a temporary workaround for the new folder structure
  // In a real app with proper public/protected routes this wouldn't be needed
  useEffect(() => {
    if (pathname && !pathname.startsWith('/app/share')) {
        const newPath = `/app${pathname}`;
        // router.replace(newPath, { scroll: false });
    }
  }, [pathname, router]);


  useEffect(() => {
    if (!firestore || !cardId) {
        if(!firestore) setLoading(false);
        return;
    };

    const fetchCard = async () => {
      try {
        const cardRef = doc(firestore, 'users', 'shared', 'cards', cardId);
        const docSnap = await getDoc(cardRef);

        if (docSnap.exists()) {
          setCard({ id: docSnap.id, ...docSnap.data() } as SharedCard);
        } else {
          setError('This card could not be found.');
        }
      } catch (e) {
        console.error('Error fetching shared card:', e);
        setError('There was an error loading this card.');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [firestore, cardId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center">
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="aspect-[9/16] w-full rounded-lg" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !card) {
    // A simple not found display as notFound() hook from next/navigation is not working as expected
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Not Found</CardTitle>
                    <CardDescription>{error || 'This card could not be found.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard">Go Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted p-4">
       <header className="py-4">
         <Logo />
       </header>
       <main className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-headline">A Card for You!</CardTitle>
              {card.createdAt && (
                 <CardDescription>
                    Created {formatDistanceToNow(new Date(card.createdAt.seconds * 1000))} ago
                 </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full rounded-lg overflow-hidden border relative bg-muted aspect-[9/16]">
                <Image src={card.cardDataUrl} alt="Shared AI-generated card" fill className="object-contain" />
              </div>
              <blockquote className="border-l-2 pl-4 italic text-sm text-muted-foreground">
                "{card.prompt}"
              </blockquote>
            </CardContent>
        </Card>
       </main>
       <footer className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Want to create your own?</p>
            <Button asChild>
                <Link href="/">Try CardCraft AI</Link>
            </Button>
       </footer>
    </div>
  );
}
