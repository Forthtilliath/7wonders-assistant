import { useNavigate } from 'react-router-dom';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui';

export function Civilians() {
  const navigate = useNavigate();

  const nextStep = () => navigate('/scores/scientifics');

  return (
    <main>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-white"
        />
      </HeaderOptions>

      <Section>
        <GroupScoreInputs step={'civilians'} />
      </Section>
    </main>
  );
}
