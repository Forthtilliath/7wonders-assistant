import { PropsWithChildren } from 'react';

export function Column({ children }: PropsWithChildren) {
  return (
    <div className="min-w-16 flex w-16 flex-col items-center justify-center odd:rounded-t odd:bg-white/10">
      {children}
    </div>
  );
}
