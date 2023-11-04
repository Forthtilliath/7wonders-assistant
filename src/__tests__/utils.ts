import type { Player } from '@types';
export function getPlayers(): Player[] {
  const LS = localStorage.getItem('players');
  return LS ? JSON.parse(LS) : [];
}
