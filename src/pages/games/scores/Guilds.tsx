import { useNavigate } from 'react-router-dom';

import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@/components/shared/Icons';
import { GroupScoreInputs } from '@/components/ui/GroupScoreInputs';

export function Guilds() {
  const navigate = useNavigate();

  const nextStep = () => navigate('/scores/armada');

  return (
    <section>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-white"
        />
      </HeaderOptions>
      <GroupScoreInputs step={'guilds'} />
    </section>
  );
}