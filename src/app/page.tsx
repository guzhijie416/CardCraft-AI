import Link from 'next/link';
import Image from 'next/image';
import {
  Paintbrush,
  Sparkles,
  Download,
  Cake,
  Gift,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/data';
import { MainNav } from '@/components/main-nav';

export default function Home() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero');

  const featureCards = [
    {
      title: 'Elegant Templates',
      description: 'Choose from a curated collection of beautiful templates for any occasion. Customize with your own words.',
      icon: <Paintbrush className="h-10 w-10 text-primary" />,
      link: '/create',
    },
    {
      title: 'AI-Powered Magic',
      description: 'Describe your vision and let our AI create a unique, one-of-a-kind card design just for you. The possibilities are endless.',
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      link: '/create/ai',
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: 'Choose Your Path',
      description: 'Select a pre-made template or decide to generate a unique card with AI.',
    },
    {
      step: 2,
      title: 'Personalize It',
      description: 'Add your custom message to a template or provide a creative prompt to our AI.',
    },
    {
      step: 3,
      title: 'Share the Love',
      description: 'Download your card, send it via email, or have it professionally printed.',
    },
  ];

  const occasionExamples = [
    { name: 'Birthday', icon: <Cake className="h-8 w-8 mx-auto text-accent" /> },
    { name: 'Holiday', icon: <Gift className="h-8 w-8 mx-auto text-accent" /> },
    { name: 'Anniversary', icon: <Heart className="h-8 w-8 mx-auto text-accent" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Create & Share Cards That Matter
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    With CardCraft AI, design beautiful digital cards using our elegant templates or unlock your creativity with the power of AI.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="font-bold">
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={heroImage.imageHint}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Simple, Creative Process</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Crafting the perfect card has never been easier. Follow these three simple steps to create something memorable.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-3 sm:gap-12 lg:gap-16 mt-12">
              {howItWorksSteps.map((step) => (
                <div key={step.step} className="grid gap-2 text-center">
                   <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                        {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold font-headline">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            {featureCards.map((feature, index) => (
              <Card key={index} className="h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="flex flex-row items-start gap-4">
                  {feature.icon}
                  <div className="grid gap-1">
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                   <Button variant="link" asChild className="p-0 h-auto mt-4">
                     <Link href={feature.link}>Learn more &rarr;</Link>
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Occasions Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">For Every Moment in Life</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
              From birthdays to 'just because,' find the perfect way to express yourself.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-8">
              {occasionExamples.map((occasion) => (
                <div key={occasion.name}>
                  {occasion.icon}
                  <p className="mt-2 font-semibold">{occasion.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Create Something Special?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join CardCraft AI today and start sending cards that leave a lasting impression.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full font-bold">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center h-16 border-t bg-card">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CardCraft AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
