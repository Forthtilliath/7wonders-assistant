import { useLocation } from 'react-router-dom';
import { domAnimation, LazyMotion, m } from 'framer-motion';

export const PageWithAnimation = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={location.pathname}
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: '0' }}
        exit={{ opacity: 0, x: '-100%' }}
        transition={{ duration: 0.3 }}
        className="flex-grow">
        {children}
      </m.div>
    </LazyMotion>
  );
};
