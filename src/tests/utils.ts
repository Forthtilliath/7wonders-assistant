import { LS_KEY } from "@/data/app";

export type Player = {
  id: string;
  name: string;
  avatar: string;
  isFavorite: string;
  isArchived: string;
};

export function getPlayers(): Player[] {
  const LS = localStorage.getItem(LS_KEY.players);
  return LS ? JSON.parse(LS) : [];
}