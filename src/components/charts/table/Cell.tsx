import { PropsWithChildren } from 'react';
import { cn } from '@/helpers';

export function Cell({
  children,
  className,
}: PropsWithChildren<PropsWithClassname>) {
  return (
    <div
      className={cn(
        'flex h-12 w-full items-center justify-center p-2',
        className
      )}>
      {children}
    </div>
  );
}
