import { PropsWithChildren } from 'react';

import { cn } from '@/helpers/tailwind';

type Props = PropsWithChildren<
  PropsWithClassname<{
    title: string;
  }>
>;

export function GroupInputs({ children, title, className }: Props) {
  return (
    <fieldset
      className={cn(
        'flex flex-col gap-4 rounded bg-wonders-blue-dark p-4',
        className
      )}>
      <legend className="rounded bg-black px-3 py-1 text-center text-xl text-white">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
