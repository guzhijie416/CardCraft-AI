import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/componentsui/card';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      title: 'Premium',
      price: '$99',
      period: '/year',
      description: 'The ultimate creative experience with unlimited access to all features.',
      features: [
        'Unlimited AI Card Generations',
        'Unlimited Template-based Cards',
        'Access to All Premium Templates',
        'Save Creation History',
        'Priority Support',
      ],
      cta: 'Go Premium',
    },
    {
      title: 'Pay-as-you-go',
      price: '$3',
      period: '/card',
      description: 'Perfect for occasional use. Buy credits for AI generation as you need them.',
      features: [
        'Pay per AI Generation',
        'Unlimited Template-based Cards',
        'Access to Free Templates',
        'No Subscription Required',
      ],
      cta: 'Buy Credits',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Find a Plan That's Right For You</h1>
        <p className="text-muted-foreground mt-2 text-lg">Whether you're a creative pro or just sending a one-off card, we have you covered.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {plans.map((plan) => (
          <Card key={plan.title} className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full font-bold" size="lg">{plan.cta}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
