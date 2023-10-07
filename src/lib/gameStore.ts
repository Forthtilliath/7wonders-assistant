import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

function produce<T>(cb: (state: T) => void) {
  return (state: T) => {
    const copy = { ...state };
    cb(copy);
    return copy;
  };
}

type Score = Record<string, number>;

type Category =
  | 'military'
  | 'treasury'
  | 'wonders'
  | 'civilians'
  | 'scientifics'
  | 'commercials'
  | 'guilds'
  | 'armada'
  | 'leaders'
  | 'cities';

interface State {
  players: Player[];
  setPlayers: (players: Player[]) => void;

  scores: Record<Category, Score>;
  setScore: (category: Category, idPlayer: string, score: number) => void;
}

export const useGameStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        players: [],
        setPlayers: (players) =>
          set(() => ({ players }), undefined, 'SET_PLAYERS'),

        scores: {
          military: {},
          treasury: {},
          wonders: {},
          civilians: {},
          scientifics: {},
          commercials: {},
          guilds: {},
          armada: {},
          leaders: {},
          cities: {},
        },
        setScore: (category, idPlayer, score) =>
          set(
            produce((state) => {
              state.scores[category][idPlayer] = score;
            }),
            undefined,
            'SET_SCORE'
          ),
      }),
      { name: 'GAME_STORE' }
    )
  )
);