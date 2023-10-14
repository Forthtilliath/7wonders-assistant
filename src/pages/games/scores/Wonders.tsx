import { useNavigate } from 'react-router-dom';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui';

export function Wonders() {
  const navigate = useNavigate();

  const nextStep = () => navigate('/scores/civilians');

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon icon={AiOutlineArrowRight} onClick={nextStep} />
      </HeaderOptions>

      <Section>
          <GroupScoreInputs step={'wonders'} />
      </Section>
    </main>
  );
}
