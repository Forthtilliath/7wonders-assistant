import { useEffect, useState } from 'react';
import { getPlayers } from '@lib/indexedDB';
import type { Player } from '@types';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const joueurs = await getPlayers();
      setPlayers(joueurs);
    };

    fetchData();
  }, []);

  return [players, setPlayers] as const;
}
