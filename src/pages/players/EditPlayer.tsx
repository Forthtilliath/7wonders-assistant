import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Player } from '@types';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon } from '@components/shared/ButtonIcon';
import { ButtonToggleIcon } from '@components/shared/ButtonToggleIcon';
import {
  BiArchiveIn,
  BiSolidArchiveOut,
  BsCheckLg,
  BsPencilFill,
  BsTrash3Fill,
  ImStarEmpty,
  ImStarFull,
} from '@components/shared/Icons';
import { assertsIsDefined, convertToNumber } from '@helpers';
import { deletePlayer, getPlayer, updatePlayer } from '@lib';

export default function EditPlayer() {
  const [player, _setPlayer] = useState<Player | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idPlayer = convertToNumber(searchParams.get('id'));

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

  const removePlayer = () => {
    assertsIsDefined(player);
    deletePlayer(player.idPlayer);

    // LS.removePlayer(idPlayer);
    navigate('/players');
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
    <main className="">
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonIcon icon={BsTrash3Fill} onClick={removePlayer} />
          <ButtonToggleIcon
            condition={player.isFavorite}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={() => setPlayer('isFavorite', (t) => !t)}
          />
          <ButtonToggleIcon
            condition={player.isArchived}
            icons={[BiArchiveIn, BiSolidArchiveOut]}
            onClick={() => setPlayer('isArchived', (t) => !t)}
          />
          <ButtonIcon icon={BsCheckLg} type="submit" />
        </HeaderOptions>

        <div className="relative mb-3 flex w-full items-stretch">
          <BsPencilFill className="absolute z-10 h-full w-8 items-center justify-center rounded py-3 pl-3 text-center text-base font-normal leading-snug text-slate-600" />
          <input
            type="text"
            placeholder="Name"
            className="w-full p-4 pl-10 text-slate-600 placeholder-slate-300"
            name="name"
            value={player.name}
            onChange={(e) => setPlayer('name', () => e.target.value)}
            required
          />
        </div>

        {/* NOTE: Si on change de page, on perd le form ! */}
        {/* Solution possible : Sidebar / Modal */}
        <p className="mt-10 text-center text-lg">Avatar</p>
        <NavLink className="mx-auto mt-3 block w-[200px]" to="/players/album">
          <div className="flex h-[200px] w-full items-center justify-center bg-wonders-blue">
            {player.avatar && (
              <img src={player.avatar} alt="Avatar" width={200} height={200} />
            )}
          </div>
          <div className="flex h-16 w-full items-center justify-center bg-wonders-blue-dark text-lg">
            Change
          </div>
        </NavLink>
      </form>
    </main>
  );
}
