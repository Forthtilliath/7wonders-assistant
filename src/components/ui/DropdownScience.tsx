import { domAnimation, LazyMotion, m } from 'framer-motion';
import { ButtonToggleIcon } from '@components/shared';
import {
  BsFillFileArrowDownFill,
  BsFillFileArrowUpFill,
} from '@components/shared/Icons';
import { cn } from '@helpers';
import { scienceAnimation } from '@lib';
import { useToggle } from '@hooks';
import { InputScience } from './InputScience';
import { compas, most, roue, tablette } from '@assets/science';

export function DropdownScience() {
  const [open, toggleOpen] = useToggle(false);

  return (
    <div className="relative">
      <ButtonToggleIcon
        condition={open}
        icons={[BsFillFileArrowDownFill, BsFillFileArrowUpFill]}
        onClick={toggleOpen}
        className={cn('m-0 text-slate-200', { 'text-green-500': open })}
        aria-label={open ? 'Close the box' : 'Open the box'}
        size="2rem"
      />

      <LazyMotion features={domAnimation}>
        <m.div
          className="absolute right-0 top-14 z-[1] box-border w-[calc(100vw_-_5rem)] rounded-xl border-2 border-green-500 bg-wonders-blue-dark p-4"
          animate={open ? 'visible' : 'hidden'}
          variants={scienceAnimation}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          initial={false}>
          <InputScience img={roue} />
          <InputScience img={tablette} />
          <InputScience img={compas} />
          <InputScience img={most} />
        </m.div>
      </LazyMotion>
    </div>
  );
}
