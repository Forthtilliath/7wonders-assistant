import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui';
import { useGameStore } from '@lib';

export function Leaders() {
  const navigate = useNavigate();
  const extensions = useGameStore((s) => s.extensions);

  useEffect(() => {
    if (!extensions.includes('leaders')) nextStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextStep = () => navigate('/scores/cities');

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-wonders-blue"
        />
      </HeaderOptions>

      <Section>
        <GroupScoreInputs step={'leaders'} />
      </Section>
    </main>
  );
}
