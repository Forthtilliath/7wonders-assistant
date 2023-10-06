import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

export const useGameStore = create<State>()(
  devtools((set) => ({
    players: [],
    setPlayers: (players) => set(() => ({ players }), undefined, 'SET_PLAYERS'),
    // increase: (by) => set((state) => ({ bears: state.bears + by })),
  }))
);
