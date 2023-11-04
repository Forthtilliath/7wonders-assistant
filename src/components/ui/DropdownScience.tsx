import { scienceAnimation } from '@/lib';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { InputScience } from './InputScience';
import { all, compass, most, tablet, wheel } from '@assets/science';

type Props = {
  open: boolean;
};

export function DropdownScience({ open }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={open ? 'visible' : 'hidden'}
        variants={scienceAnimation}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        initial={false}
        className="overflow-hidden">
        <div className="box-border w-full rounded-xl border-2 border-green-500 bg-wonders-blue-dark p-4">
          <InputScience img={wheel} name="wheel" />
          <InputScience img={tablet} name="tablet" />
          <InputScience img={compass} name="compass" />
          <InputScience img={most} name="most" />
          <InputScience img={all} name="all" />
          {/* TODO: Comment gérer les masques ??? */}
          {/* 
            TODO: Add score par triplet : 7 par défaut
            - Boutons radios 7 / 10 / 13 ???
          */}
        </div>
      </m.div>
    </LazyMotion>
  );
}
