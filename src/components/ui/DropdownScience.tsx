import { scienceAnimation } from '@/lib';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { ScienceInput } from './inputs/ScienceInput';
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
          <ScienceInput min={0} img={wheel} name="wheel" />
          <ScienceInput min={0} img={tablet} name="tablet" />
          <ScienceInput min={0} img={compass} name="compass" />
          <ScienceInput min={0} img={most} name="most" />
          <ScienceInput min={0} img={all} name="all" />
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
