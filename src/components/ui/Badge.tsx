import { PropsWithChildren } from 'react';
import { cn } from '@/helpers';

type Props = PropsWithChildren<PropsWithClassname>;

export function Badge({ children, className }: Props) {
  return (
    <span
      className={cn(
        'mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        className
      )}>
      {children}
    </span>
  );
}
