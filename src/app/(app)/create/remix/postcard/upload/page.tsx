
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const uploadFormSchema = z.object({
  photo: z.any().refine(fileList => fileList && fileList.length === 1, 'Please upload one image file.'),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export default function PostcardUploadPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('photo', e.target.files);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImagePreview(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: UploadFormValues) => {
    if (!imagePreview) {
        toast({
            variant: 'destructive',
            title: 'No Image Selected',
            description: 'Please upload an image to continue.',
        });
        return;
    }
    
    // Store the data URI in session storage to pass it to the next page
    sessionStorage.setItem('postcardImage', imagePreview);
    router.push('/create/remix/postcard-editor');
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Upload a Photo</CardTitle>
              <CardDescription>Choose a photo from your device to create your postcard.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Upload Photo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </FormControl>
                      <Card 
                        className="border-2 border-dashed hover:border-primary cursor-pointer aspect-video flex items-center justify-center text-muted-foreground"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <Image src={imagePreview} alt="Uploaded photo preview" width={400} height={250} className="object-contain h-full w-full rounded-md" />
                        ) : (
                          <div className="text-center p-8">
                            <UploadCloud className="mx-auto h-12 w-12" />
                            <p className="mt-2 font-semibold">Click to browse or drag & drop</p>
                            <p className="text-sm text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter className='flex-col gap-4'>
              <Button type="submit" size="lg" className="w-full" disabled={!imagePreview}>
                Next: Style Your Postcard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="ghost" asChild>
                  <Link href="/create/remix/postcard">
                    Back to options
                  </Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
