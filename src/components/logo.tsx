import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Sparkles className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl font-headline text-foreground">
        CardCraft AI
      </span>
    </div>
  );
}
