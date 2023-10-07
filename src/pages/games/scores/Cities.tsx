// import { useNavigate } from 'react-router-dom';

import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@/components/shared/Icons';
import { GroupScoreInputs } from '@/components/ui/GroupScoreInputs';

export function Cities() {
  // const navigate = useNavigate();

  const nextStep = () => {
    // END OF THE GAME
    // SAVE SCORES !!!
  };

  return (
    <section>
      <HeaderOptions>
        <ButtonIcon
          icon={AiOutlineArrowRight}
          onClick={nextStep}
          className="text-white"
        />
      </HeaderOptions>
      <GroupScoreInputs step={'cities'} />
    </section>
  );
}
