import { PropsWithChildren } from 'react';

export function HeaderOptions({ children }: PropsWithChildren) {
  return (
    <div className="fixed -top-16 pr-2 flex h-16 items-center text-wonders-yellow max-w-app mx-auto w-full justify-end left-1/2 -translate-x-1/2">
      {children}
    </div>
  );
}
