
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Camera, UploadCloud } from 'lucide-react';

export default function PostcardStartPage() {
  const options = [
    {
      title: 'Take a Photo',
      description: 'Use your device camera to capture a new moment for your postcard.',
      icon: Camera,
      href: '/create/remix/camera',
    },
    {
      title: 'Upload a Photo',
      description: 'Choose an existing photo from your device to turn into a postcard.',
      icon: UploadCloud,
      href: '/create/remix/postcard/upload',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Create Your Postcard</h1>
        <p className="text-muted-foreground mt-2 text-lg">How would you like to start?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {options.map((option) => (
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
