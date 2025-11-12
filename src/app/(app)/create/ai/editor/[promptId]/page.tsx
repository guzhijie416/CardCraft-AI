import { masterPrompts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { AiCardEditor } from '@/components/ai-card-editor';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';

export default function AiEditorPage({ params }: { params: { promptId: string } }) {
  const masterPrompt = masterPrompts.find(p => p.id === params.promptId);

  if (!masterPrompt) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        {/* Simple Breadcrumb for context. In a real app this would be more robust. */}
        <div className="text-sm text-muted-foreground mb-4">
          <Link href="/create" className="hover:underline">Create</Link>
          <span className="mx-2">/</span>
          <Link href="/create/ai" className="hover:underline">AI</Link>
          <span className="mx-2">/</span>
          <Link href={`/create/ai/${masterPrompt.occasion}`} className="hover:underline">Style</Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-foreground">Personalize</span>
        </div>
      </div>
      <AiCardEditor masterPrompt={masterPrompt} />
    </div>
  );
}
// This is a workaround to satisfy the request to not use route groups, even though they are best practice.
// Normally, the following component would be in its own file.
import Link from 'next/link';

export function BreadcrumbDemo() {
 return null
}
