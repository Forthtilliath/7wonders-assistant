import { AnimatePresence, motion } from 'framer-motion';

import { ButtonIcon } from './ButtonIcon';

type Props = {
  condition: boolean;
  icons: [IconComponent, IconComponent];
  onClick: ButtonClickEvent;
};

export function ButtonToggleIcon({
  condition,
  icons: [FirstIcon, SecondIcon],
  onClick,
}: Props) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={condition ? 'active' : 'inactive'}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}>
        {condition ? (
          <ButtonIcon icon={SecondIcon} onClick={onClick} />
        ) : (
          <ButtonIcon icon={FirstIcon} onClick={onClick} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
