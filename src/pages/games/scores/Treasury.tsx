import { useNavigate } from 'react-router-dom';

import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@/components/shared/Icons';
import { GroupScoreInputs } from '@/components/ui/GroupScoreInputs';

export function Treasury() {
  const navigate = useNavigate();

  const nextStep = () => navigate('/scores/wonders');

  return (
    <section>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-wonders-blue"
        />
      </HeaderOptions>
      <GroupScoreInputs step={'treasury'} />
    </section>
  );
}
