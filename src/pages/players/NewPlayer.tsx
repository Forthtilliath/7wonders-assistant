import * as LS from '@/lib/storage';
import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { ButtonToggleIcon } from '@/components/shared/ButtonToggleIcon';
import {
  BsCheckLg,
  BsPencilFill,
  GiMeeple,
  ImStarEmpty,
  ImStarFull,
} from '@/components/shared/Icons';
import { generateUuidv4 } from '@/helpers/string';
import { useToggle } from '@/hooks/useToggle';
import { NavLink, useNavigate } from 'react-router-dom';

export default function NewPlayer() {
    const navigate = useNavigate();
  const [favorite, toggleFavorite] = useToggle(false);

  const onSubmit: FormSubmitEvent = async (e) => {
    e.preventDefault();
    const player = new FormData(e.currentTarget);
    player.append('id', generateUuidv4());
    player.append('avatar', '/assets/images/defaultAvatar.webp');
    player.append('isFavorite', favorite ? 'true' : 'false');

    LS.addPlayer(Object.fromEntries(player) as Player);

    navigate('/players');
  };

  return (
    <main className="">
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonToggleIcon
            condition={favorite}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={toggleFavorite}
          />
          <ButtonIcon icon={BsCheckLg} onClick={console.log} type="submit" />
        </HeaderOptions>

        <div className="relative mb-3 flex w-full flex-wrap items-stretch">
          <BsPencilFill className="absolute z-10 h-full w-8 items-center justify-center rounded py-3 pl-3 text-center text-base font-normal leading-snug text-slate-600" />
          <input
            type="text"
            placeholder="Name"
            className="w-full p-4 pl-10 text-slate-600 placeholder-slate-300"
            name="name"
            required
          />
        </div>

        {/* NOTE: Si on change de page, on perd le form ! */}
        {/* Solution possible : Sidebar / Modal */}
        <p className="mt-10 text-center text-lg">Avatar</p>
        <NavLink className="mx-auto mt-3 block w-[200px]" to="/players/album">
          <div className="flex h-[200px] w-full items-center justify-center bg-wonders-blue">
            <GiMeeple size={'5rem'} />
          </div>
          <div className="flex h-16 w-full items-center justify-center bg-wonders-blue-dark text-lg">
            Change
          </div>
        </NavLink>
      </form>
    </main>
  );
}