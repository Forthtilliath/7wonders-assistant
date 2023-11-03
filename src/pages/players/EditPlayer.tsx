import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useConfirm } from '@/hooks/useConfirm';
import type { Player } from '@types';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon, ButtonToggleIcon } from '@components/shared';
import {
  BiArchiveIn,
  BiSolidArchiveOut,
  BsCheckLg,
  BsTrash3Fill,
  ImStarEmpty,
  ImStarFull,
} from '@components/shared/Icons';
import { InputPlayer } from '@components/ui';
import { assertsIsDefined } from '@helpers';
import { getPlayer, updatePlayer } from '@lib';
import { useParamsInt } from '@hooks';

export default function EditPlayer() {
  const [player, _setPlayer] = useState<Player | null>(null);
  const navigate = useNavigate();
  const { idPlayer } = useParamsInt('idPlayer');
  const inputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();

  const setPlayer = <Key extends keyof Player>(
    key: Key,
    cb: (currentValue: Player[Key]) => Player[Key]
  ) => {
    _setPlayer((p) => {
      if (!p) return null;

      return {
        ...p,
        [key]: cb(p[key]),
      };
    });
  };

  useEffect(() => {
    if (!idPlayer) return;
    const loadPlayer = async () => {
      const player = await getPlayer(idPlayer);
      _setPlayer(player);
    };
    loadPlayer();
  }, [idPlayer]);

  const removePlayer = async () => {
    assertsIsDefined(player);

    if (
      await confirm({
        title: `Supprimer un utilisateur`,
        content: `Voulez-vous supprimer l'utilisateur ${player.name} ?`,
        showIcon: true,
        colorIcon: 'alert',
      })
    ) {
      console.log('Deleting player');

      player.isDeleted = true;
      await updatePlayer(player);

      navigate('/players');
    }
  };

  const onSubmit: FormSubmitEventHandler = async (e) => {
    e.preventDefault();
    assertsIsDefined(player);

    // TODO
    if (player.name.trim() === '') {
      // ERROR Empty Name
      return;
    }

    await updatePlayer(player);

    navigate('/players');
  };

  if (!player) {
    return <>No player</>;
  }

  return (
    <main>
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonIcon icon={BsTrash3Fill} onClick={removePlayer}>
            <span className="sr-only">Delete the player</span>
          </ButtonIcon>
          <ButtonToggleIcon
            condition={player.isFavorite}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={() => setPlayer('isFavorite', (t) => !t)}>
            <span className="sr-only">
              {player.isFavorite
                ? 'Unfavorite the player'
                : 'Favorite the player'}
            </span>
          </ButtonToggleIcon>
          <ButtonToggleIcon
            condition={player.isArchived}
            icons={[BiArchiveIn, BiSolidArchiveOut]}
            onClick={() => setPlayer('isArchived', (t) => !t)}>
            <span className="sr-only">
              {player.isArchived
                ? 'Unarchive the player'
                : 'Archive the player'}
            </span>
          </ButtonToggleIcon>
          <ButtonIcon icon={BsCheckLg} type="submit">
            <span className="sr-only">Confirm the modifications</span>
          </ButtonIcon>
        </HeaderOptions>

        <Section className="p-0">
          <InputPlayer
            ref={inputRef}
            value={player.name}
            onChange={(e) => setPlayer('name', () => e.target.value)}
          />

          {/* NOTE: Si on change de page, on perd le form ! */}
          {/* Solution possible : Sidebar / Modal */}
          <p className="mt-10 text-center text-lg">Avatar</p>
          <NavLink className="mx-auto mt-3 block w-[200px]" to="/players/album">
            <div className="flex h-[200px] w-full items-center justify-center bg-wonders-blue">
              {player.avatar && (
                <img
                  src={player.avatar}
                  alt="Avatar"
                  width={200}
                  height={200}
                />
              )}
            </div>
            <div className="flex h-16 w-full items-center justify-center bg-wonders-blue-dark text-lg">
              Change
            </div>
          </NavLink>
        </Section>
      </form>
    </main>
  );
}
