import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/lib';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui';

export function Armada() {
  const navigate = useNavigate();
  const extensions = useGameStore((s) => s.extensions);

  useEffect(() => {
    if (!extensions.includes('Armada')) nextStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextStep = () => navigate('/scores/leaders');

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-wonders-blue-dark"
        />
      </HeaderOptions>

      <Section>
        <GroupScoreInputs step={'armada'} />
      </Section>
    </main>
  );
}
