import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, PlusCircle, Sparkles, BookOpen } from 'lucide-react';
import { historyItems, placeholderImages } from '@/lib/data';

export default function DashboardPage() {
  const quickActions = [
    { title: 'From Template', description: 'Pick a pre-designed card.', icon: BookOpen, href: '/create' },
    { title: 'With AI', description: 'Generate a unique design.', icon: Sparkles, href: '/create/ai' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's a quick look at your creative world.</p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold font-headline mb-4">Start Creating</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {quickActions.map(action => (
            <Card key={action.title} className="flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <action.icon className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="font-headline">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={action.href}>
                    Create Now <PlusCircle className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Creations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold font-headline">Recent Creations</h2>
          <Button variant="link" asChild>
            <Link href="/history">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {historyItems.map((item) => {
            const image = placeholderImages.find(p => p.id === item.imageId);
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      width={400}
                      height={500}
                      data-ai-hint={image.imageHint}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground truncate">"{item.prompt}"</p>
                    <p className="text-xs text-muted-foreground mt-2">{item.createdAt}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
