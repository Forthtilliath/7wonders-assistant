import { useEffect, useState } from 'react';

import * as LS from '@/lib/storage';
import { assertsIsDefined } from '@/helpers/assets';

export function usePlayer(id: Player['id'] | null) {
  const [player, setPlayer] = useState<Player>({
    id: '',
    name: '',
    isFavorite: 'false',
    isArchived: 'false',
    avatar: '/assets/images/defaultAvatar.webp',
  });

  useEffect(() => {
    assertsIsDefined(id);

    const player = LS.getPlayer(id);
    if (player) setPlayer(player);
  }, [id]);

  const toggleFavorite = () =>
    setPlayer((p) => ({
      ...p,
      isFavorite: p.isFavorite === 'true' ? 'false' : 'true',
    }));
  
  const toggleArchive = () =>
    setPlayer((p) => ({
      ...p,
      isArchived: p.isArchived === 'true' ? 'false' : 'true',
    }));

  return [player, { toggleFavorite, toggleArchive }] as const;
}
