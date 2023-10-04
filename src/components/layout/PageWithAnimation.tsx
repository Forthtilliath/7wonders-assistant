'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageWithAnimation = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: '0' }}
        exit={{ opacity: 0, x: '-100%' }}
        // transition={{ duration: 0.3 }}
        // transition={{
        //   type: "spring",
        //   stiffness: 260,
        //   damping: 20,
        // }}
        className="flex-grow">
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageWithAnimation;
