
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, BookOpen, ImageIcon, Gem, Clock } from 'lucide-react';

export default function CreatePage() {
  const creationOptions = [
    {
      title: 'Classic Card',
      description: 'Choose from our library of professionally designed templates for any occasion.',
      icon: BookOpen,
      href: '/create/template',
      linkText: 'Browse Templates',
    },
    {
      title: 'AI Studio',
      description: 'Let your imagination run wild. Describe your perfect card and our AI will bring it to life.',
      icon: Sparkles,
      href: '/create/ai',
      linkText: 'Start with AI',
    },
    {
      title: 'Signature Studio',
      description: 'Start with a masterpiece. Remix curated, professional designs with your own twist.',
      icon: Gem,
      href: '/create/signature',
      linkText: 'Remix a Signature Card',
    },
    {
      title: 'Moments Studio',
      description: 'Craft stunning images from your daily moments by filling in a few simple details.',
      icon: Clock,
      href: '/create/moments',
      linkText: 'Capture a Moment',
    },
    {
      title: 'Photo Remix',
      description: 'Use your own photos to create a postcard or transfer the style to a new AI image.',
      icon: ImageIcon,
      href: '/create/remix',
      linkText: 'Remix a Photo',
    }
];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">How would you like to create?</h1>
        <p className="text-muted-foreground mt-2 text-lg">Choose your creative path.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {creationOptions.map((option) => (
          <Link href={option.href} key={option.title} className="block">
            <Card className="h-full text-center p-8 flex flex-col items-center justify-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full">
                  <option.icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">{option.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{option.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
