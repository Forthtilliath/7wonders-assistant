import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/helpers';
import { domAnimation, LazyMotion, m } from 'framer-motion';

type Props = PropsWithChildren<PropsWithClassname>;

export const PageWithAnimation = ({ className, children }: Props) => {
  const location = useLocation();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={location.pathname}
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: '0' }}
        exit={{ opacity: 0, x: '-100%' }}
        transition={{ duration: 0.3 }}
        className={cn(className)}>
        {children}
      </m.div>
    </LazyMotion>
  );
};
