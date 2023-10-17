import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Player } from '@types';

function produce<T>(cb: (state: T) => void) {
  return (state: T) => {
    const copy = { ...state };
    cb(copy);
    return copy;
  };
}

interface State {
  extensions: Record<Extension, boolean>;
  setExtensions: (extensions: Record<Extension, boolean>) => void;

  players: Player[];
  setPlayers: (players: Player[]) => void;

  scores: Record<Player['idPlayer'], Record<Category, number>>;
  setScore: (category: Category, idPlayer: number, score: number) => void;

  resetGame: () => void;
}

export const useGameStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        extensions: {} as Record<Extension, boolean>,
        setExtensions: (extensions) =>
          set(() => ({ extensions }), undefined, 'SET_EXTENSIONS'),

        players: [],
        setPlayers: (players) =>
          set(() => ({ players }), undefined, 'SET_PLAYERS'),

        scores: {},
        setScore: (category, idPlayer, score) =>
          set(
            produce((state) => {
              state.scores[idPlayer] ||= {
                military: 0,
                treasury: 0,
                wonders: 0,
                civilians: 0,
                scientifics: 0,
                commercials: 0,
                guilds: 0,
                armada: 0,
                leaders: 0,
                cities: 0,
              };
              state.scores[idPlayer][category] = score;
            }),
            undefined,
            'SET_SCORE'
          ),

        resetGame: () =>
          set(
            {
              players: [],
              scores: {},
            },
            undefined,
            'RESET_GAME'
          ),
      }),
      { name: 'GAME_STORE' }
    )
  )
);
