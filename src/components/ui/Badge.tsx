import { cn } from '@helpers';

type Props = PropsWithClassname<{
  label: string;
}>;

export function Badge({ label, className }: Props) {
  return (
    <span
      className={cn(
        'mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        className
      )}>
      {label}
    </span>
  );
}
