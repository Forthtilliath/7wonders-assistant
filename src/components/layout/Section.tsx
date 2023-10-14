import { PropsWithChildren } from 'react';
import { cn } from '@/helpers';

type Props = PropsWithChildren<PropsWithClassname>;
export function Section({ children, className }: Props) {
  return (
    <section className={cn('h-section overflow-y-auto p-4', className)}>
      {children}
    </section>
  );
}
