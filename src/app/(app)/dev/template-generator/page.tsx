'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { allOccasions } from '@/lib/data';
import { Sparkles, Loader2 } from 'lucide-react';

// Mock data for generated images - we will replace this with real AI generation
const mockGeneratedImages = [
  {
    id: 'gen-1',
    url: 'https://picsum.photos/seed/gen1/400/500',
    hint: 'abstract art',
  },
  {
    id: 'gen-2',
    url: 'https://picsum.photos/seed/gen2/400/500',
    hint: 'mountain landscape',
  },
  {
    id: 'gen-3',
    url: 'https://picsum.photos/seed/gen3/400/500',
    hint: 'city skyline',
  },
  {
    id: 'gen-4',
    url: 'https://picsum.photos/seed/gen4/400/500',
    hint: 'floral pattern',
  },
];

type GeneratedImage = {
  id: string;
  url: string;
  hint: string;
  category?: string;
  selected?: boolean;
};

export default function TemplateGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] =
    useState<GeneratedImage[]>([]);

  const handleGenerate = () => {
    setIsLoading(true);
    // In the future, this will call our AI batch generation flow
    setTimeout(() => {
      setGeneratedImages(
        mockGeneratedImages.map((img) => ({ ...img, selected: false }))
      );
      setIsLoading(false);
    }, 2000); // Simulate network delay
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, selected } : img))
    );
  };

  const handleCategoryChange = (id: string, category: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, category } : img))
    );
  };

  const handleSaveChanges = () => {
    const selectedTemplates = generatedImages.filter((img) => img.selected);
    console.log('Saving selected templates:', selectedTemplates);
    // Here we would add the logic to save these to our `templates` data structure
    alert(
      `Selected ${selectedTemplates.length} templates. Check console for details.`
    );
  };

  const selectedCount = generatedImages.filter((img) => img.selected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Template Generator
        </h1>
        <p className="text-muted-foreground">
          Generate batches of AI images and curate them to create new templates
          for your users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generation Controls</CardTitle>
          <CardDescription>
            Click the button to generate a new batch of 10-20 images. This
            process will use a variety of internal prompts to create diverse
            designs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate New Batch
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0 aspect-[4/5] bg-muted rounded-t-lg" />
              <CardFooter className="p-4 space-y-4" >
                 <div className="h-10 bg-muted rounded w-full" />
                 <div className="h-10 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {generatedImages.length > 0 && !isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {generatedImages.map((image) => (
              <Card
                key={image.id}
                className={`overflow-hidden transition-all ${
                  image.selected ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-0 aspect-[4/5] bg-muted relative">
                  <Image
                    src={image.url}
                    alt={image.hint}
                    width={400}
                    height={500}
                    data-ai-hint={image.hint}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-full">
                    <Checkbox
                      id={`select-${image.id}`}
                      checked={image.selected}
                      onCheckedChange={(checked) =>
                        handleSelectionChange(image.id, !!checked)
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-4 flex-col items-start gap-2">
                  <Label htmlFor={`category-${image.id}`} className="text-xs">
                    Assign Category
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleCategoryChange(image.id, value)
                    }
                    defaultValue={image.category}
                  >
                    <SelectTrigger id={`category-${image.id}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allOccasions.map((occasion) => (
                        <SelectItem key={occasion.id} value={occasion.id}>
                          {occasion.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-0 py-4 bg-background/90 backdrop-blur-sm z-10 text-center">
            <Button
              size="lg"
              onClick={handleSaveChanges}
              disabled={selectedCount === 0}
            >
              Save {selectedCount > 0 ? selectedCount : ''} Selected Templates
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
