import { PropsWithChildren } from 'react';
import { cn } from '@helpers';

type Props = PropsWithChildren<PropsWithClassname>;
export function Section({ children, className }: Props) {
  return (
    <section
      className={cn(
        'mx-auto h-section max-w-app overflow-y-auto p-4',
        className
      )}>
      {children}
    </section>
  );
}
