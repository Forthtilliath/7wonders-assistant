import type { Player } from '@/@types/storage';
import { LS_KEY } from '@/data/app';

export function getPlayers(): Player[] {
  const LS = localStorage.getItem(LS_KEY.players);
  return LS ? JSON.parse(LS) : [];
}
