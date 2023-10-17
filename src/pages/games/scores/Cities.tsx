import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHistory } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon } from '@components/shared';
import { AiOutlineArrowRight } from '@components/shared/Icons';
import { GroupScoreInputs } from '@components/ui';
import { sum } from '@helpers';
import { createGame, createGameHistory, useGameStore } from '@lib';

export function Cities() {
  const scores = useGameStore((s) => s.scores);
  const players = useGameStore((s) => s.players);
  const extensions = useGameStore((s) => s.extensions);
  const resetGame = useGameStore((s) => s.resetGame);
  const navigate = useNavigate();
  const isCreated = useRef(false);

  useEffect(() => {
    if (players.length === 0) navigate('/');
    if (!extensions?.Cities) nextStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextStep = async () => {
    if (isCreated.current) return;
    isCreated.current = true;
    const game = { ...extensions, createdAt: Date.now() };
    const { idGame } = await createGame(game);

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

    navigate(`/history/${idGame}`, { state: { from: '/history' } });
  };

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
        <GroupScoreInputs step={'cities'} />
      </Section>
    </main>
  );
}
