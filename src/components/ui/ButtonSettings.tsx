import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { cn } from '@/helpers';

type Props = PropsWithChildren<
  ComponentPropsWithoutRef<'button'> & {
    color?: 'primary' | 'warning';
  }
>;

export function ButtonSettings({
  children,
  className,
  color,
  ...buttonProps
}: Props) {
  return (
    <button
      className={cn(
        'rounded border-2 px-4 py-2 text-sm font-bold uppercase shadow outline-none transition-all duration-150 ease-linear focus:outline-none',
        {
          'active:bg-wonders-blue-light border-blue-950 bg-wonders-blue':
            color === 'primary',
          'border-red-950 bg-red-800 active:bg-red-600': color === 'warning',
          'bg-transparent active:bg-transparent/10': buttonProps.disabled,
        },
        className
      )}
      type="button"
      {...buttonProps}>
      {children}
    </button>
  );
}
