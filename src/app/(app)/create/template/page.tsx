
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { allOccasions } from '@/lib/data';

export default function TemplateOccasionPage() {
  const templateCategories = allOccasions.filter(o => ['nature', 'architecture', 'abstract', 'birthday', 'holiday', 'wedding', 'graduation'].includes(o.id));

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Create from a Template</h1>
        <p className="text-muted-foreground mt-2 text-lg">First, choose a category for your card.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {templateCategories.map((occasion) => (
            <Link href={`/create/template/${occasion.id}`} key={occasion.id} className="block group">
              <Card className="text-center p-6 flex flex-col items-center justify-center aspect-square transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-primary/5">
                <CardContent className="p-0 flex flex-col items-center justify-center gap-4">
                  <div className="bg-secondary p-4 rounded-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <occasion.icon className="h-10 w-10 text-primary transition-colors group-hover:text-primary-foreground" />
                  </div>
                  <span className="font-semibold font-headline text-lg">{occasion.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
