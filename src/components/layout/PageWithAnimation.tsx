import { PropsWithChildren, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageAnimationStore } from '@lib';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { cn } from '@helpers';

type Props = PropsWithChildren<PropsWithClassname>;

export const PageWithAnimation = ({ className, children }: Props) => {
  const location = useLocation();
  const isPrevious = usePageAnimationStore((s) => s.isPrevious);
  const setPrevious = usePageAnimationStore((s) => s.setIsPrevious);

  useEffect(() => setPrevious(false), [location, setPrevious]);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={location.pathname}
        initial={{ opacity: 0, x: isPrevious ? -200 : 200 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isPrevious ? 200 : -200 }}
        transition={{ duration: 0.3, staggerChildren: 1 }}
        className={cn(className)}>
        {children}
      </m.div>
    </LazyMotion>
  );
};
