
import { masterPrompts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { AiCardEditor } from '@/components/ai-card-editor';
import Link from 'next/link';

export default function AiEditorPage({ params }: { params: { promptId: string } }) {
  const masterPrompt = masterPrompts.find(p => p.id === params.promptId);

  if (!masterPrompt) {
    notFound();
  }
  
  const breadcrumbBase = masterPrompt.occasion === 'postcard' ? '/create/remix' : '/create/ai';


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        {/* Simple Breadcrumb for context. In a real app this would be more robust. */}
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/create" className="hover:underline">Create</Link>
          <span className="mx-2">/</span>
          <Link href={breadcrumbBase} className="hover:underline">{masterPrompt.occasion === 'postcard' ? 'Remix' : 'AI'}</Link>
          <span className="mx-2">/</span>
          {masterPrompt.occasion !== 'postcard' && (
            <>
                <Link href={`/create/ai/${masterPrompt.occasion}`} className="hover:underline">Style</Link>
                <span className="mx-2">/</span>
            </>
          )}
          <span className="font-semibold text-foreground">Personalize</span>
        </div>
      </div>
      <AiCardEditor masterPrompt={masterPrompt} />
    </div>
  );
}
