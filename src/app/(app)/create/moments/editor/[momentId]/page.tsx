
'use client';

import { notFound } from 'next/navigation';
import { momentCategories } from '@/lib/data';
import Link from 'next/link';
// We will create this new editor component in the next step
// import { MomentEditor } from '@/components/moment-editor'; 

export default function MomentEditorPage({ params }: { params: { momentId: string } }) {
  
  const momentTemplate = momentCategories.flatMap(c => c.templates).find(t => t.id === params.momentId);

  if (!momentTemplate) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/create" className="hover:underline">Create</Link>
          <span className="mx-2">/</span>
          <Link href="/create/moments" className="hover:underline">Moments Studio</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-foreground">{momentTemplate.title}</span>
        </div>
      </div>
      
      {/* Placeholder for the new MomentEditor */}
      <div className="text-center p-8 bg-yellow-100 text-yellow-800 rounded-md">
        <h2 className="text-xl font-bold">Coming Soon: The Moment Editor</h2>
        <p className="mt-2">This is where the new "fill-in-the-blanks" editor for the "{momentTemplate.title}" moment will go.</p>
      </div>

    </div>
  );
}
