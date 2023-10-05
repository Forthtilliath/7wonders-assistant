import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';

import * as LS from '@/lib/storage';
import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { ButtonToggleIcon } from '@/components/shared/ButtonToggleIcon';
import {
  BsCheckLg,
  BsPencilFill,
  BsTrash3Fill,
  ImStarEmpty,
  ImStarFull,
} from '@/components/shared/Icons';
import { assertsIsDefined } from '@/helpers/assets';
import { usePlayer } from '@/hooks/usePlayer';

export default function EditPlayer() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [player, { toggleFavorite }] = usePlayer(id);

  const { isFavorite, avatar, name } = player;

  const deletePlayer = () => {
    assertsIsDefined(id);

    LS.removePlayer(id);
    navigate('/players');
  };

  const onSubmit: FormSubmitEventHandler = async (e) => {
    e.preventDefault();
    assertsIsDefined(id);

    const player = new FormData(e.currentTarget);
    player.append('id', id);
    player.append('avatar', avatar);
    player.append('isFavorite', isFavorite);

    LS.setPlayer(Object.fromEntries(player) as Player);

    navigate('/players');
  };

  return (
    <main className="">
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonIcon icon={BsTrash3Fill} onClick={deletePlayer} />
          <ButtonToggleIcon
            condition={isFavorite === 'true'}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={toggleFavorite}
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
            defaultValue={name}
            required
          />
        </div>

        {/* NOTE: Si on change de page, on perd le form ! */}
        {/* Solution possible : Sidebar / Modal */}
        <p className="mt-10 text-center text-lg">Avatar</p>
        <NavLink className="mx-auto mt-3 block w-[200px]" to="/players/album">
          <div className="flex h-[200px] w-full items-center justify-center bg-wonders-blue">
            {avatar && (
              <img src={avatar} alt="Avatar" width={200} height={200} />
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
