import { useEffect, useState } from 'react';

import * as LS from '@/lib/storage';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const players = LS.getPlayers();
    setPlayers(players);
  }, []);

  return [players, setPlayers] as const;
}