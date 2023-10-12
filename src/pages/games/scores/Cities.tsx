import { GameHistory } from '@types';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui/GroupScoreInputs';
import { createGame, createGameHistory, useGameStore } from '@lib';

export function Cities() {
  const scores = useGameStore((s) => s.scores);
  const extensions = useGameStore((s) => s.extensions);
  // const navigate = useNavigate();

  const nextStep = async () => {
    const { idGame } = await createGame(extensions);

    const gameHistories = Object.entries(scores).map<GameHistory>(
      ([idPlayer, scores]) => ({
        ...scores,
        idPlayer: parseInt(idPlayer, 10),
        idGame,
        total: 0,
        ranking: 1,
      })
    );

    await createGameHistory(gameHistories);
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
