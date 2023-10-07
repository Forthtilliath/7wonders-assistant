import { useNavigate } from 'react-router-dom';

import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@/components/shared/Icons';
import { GroupScoreInputs } from '@/components/ui/GroupScoreInputs';

export function Wonders() {
  const navigate = useNavigate();

  const nextStep = () => navigate('/scores/civilians');

  return (
    <section>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
        />
      </HeaderOptions>
      <GroupScoreInputs step={'wonders'} />
    </section>
  );
}