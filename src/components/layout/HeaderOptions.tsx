import { PropsWithChildren } from 'react';
import { cn } from '@/helpers';

export function HeaderOptions({ children }: PropsWithChildren) {
  return (
    <div
      className={cn(
        'fixed -top-16 left-1/2 mx-auto -translate-x-1/2 pr-2',
        'max-w-app flex h-16 w-full items-center justify-end',
        'pointer-events-none text-wonders-yellow '
      )}>
      {children}
    </div>
  );
}
