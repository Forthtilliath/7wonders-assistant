import type { Player } from '@types';
import { LS_KEY } from '@constants';

export function getPlayers(): Player[] {
  const LS = localStorage.getItem(LS_KEY.players);
  return LS ? JSON.parse(LS) : [];
}
