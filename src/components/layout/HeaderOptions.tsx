import { PropsWithChildren } from 'react';

export function HeaderOptions({ children }: PropsWithChildren) {
  return (
    <div className="max-w-app pointer-events-none fixed -top-16 left-1/2 mx-auto flex h-16 w-full -translate-x-1/2 items-center justify-end pr-2 text-wonders-yellow">
      {children}
    </div>
  );
}
