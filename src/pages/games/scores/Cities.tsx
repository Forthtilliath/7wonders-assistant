import { useNavigate } from 'react-router-dom';
import { sum } from '@/helpers';
import { GameHistory } from '@types';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared/ButtonIcon';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui/GroupScoreInputs';
import { createGame, createGameHistory, useGameStore } from '@lib';

export function Cities() {
  const scores = useGameStore((s) => s.scores);
  const extensions = useGameStore((s) => s.extensions);
  const resetGame = useGameStore((s) => s.resetGame);
  const navigate = useNavigate();

  const nextStep = async () => {
    const { idGame } = await createGame(extensions);

    const gameHistories = Object.entries(scores).map<GameHistory>(
      ([idPlayer, scores]) => ({
        ...scores,
        idPlayer: parseInt(idPlayer, 10),
        idGame,
        total: sum(Object.values(scores)),
        ranking: 1,
      })
    );

    await createGameHistory(gameHistories);
    resetGame();

    navigate(`/history/${idGame}`);
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
