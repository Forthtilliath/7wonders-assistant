import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type State = {
  isPrevious: boolean;

  setIsPrevious: (value: boolean) => void;
};

export const usePageAnimationStore = create<State>()(
  devtools((set) => ({
    isPrevious: false,
    setIsPrevious: (value) => set({ isPrevious: value }, undefined, "SET_PREVIOUS"),
  }))
);
