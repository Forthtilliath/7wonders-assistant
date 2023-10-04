import { PropsWithChildren } from 'react';

export function HeaderOptions({ children }: PropsWithChildren) {
  return (
    <div className="fixed -top-16 right-0 flex h-16 items-center text-wonders-yellow">
      {children}
    </div>
  );
}
