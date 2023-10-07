import { AnimatePresence, motion } from 'framer-motion';

import { ButtonIcon } from './ButtonIcon';

type Props = Omit<Parameters<typeof ButtonIcon>[0], 'icon'> & {
  condition: boolean;
  icons: [IconComponent, IconComponent];
  onClick: ButtonClickEventHandler;
};

export function ButtonToggleIcon({
  condition,
  icons: [FirstIcon, SecondIcon],
  ...buttonProps
}: Props) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={condition ? 'active' : 'inactive'}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}>
        {condition ? (
          <ButtonIcon icon={SecondIcon} {...buttonProps} />
        ) : (
          <ButtonIcon icon={FirstIcon} {...buttonProps} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
