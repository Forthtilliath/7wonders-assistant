import { PropsWithChildren } from 'react';
import { m } from 'framer-motion';
import { cn } from '@helpers';
import { headerOptionsAnimation } from '@lib';


export function HeaderOptions({ children }: PropsWithChildren) {
  return (
    <m.div
      className={cn(
        'fixed left-1/2 top-0 mx-auto -translate-x-1/2 pr-2',
        'flex h-16 w-full max-w-app items-center justify-end',
        'z-1 pointer-events-none text-wonders-yellow'
      )}
      variants={headerOptionsAnimation}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.3, duration: 0.2, ease: 'easeInOut' }}>
      {children}
    </m.div>
  );
}