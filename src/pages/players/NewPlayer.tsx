import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import * as LS from '@/lib/storage';
import { HeaderOptions } from '@/components/layout/HeaderOptions';
import { ButtonIcon } from '@/components/shared/ButtonIcon';
import { ButtonToggleIcon } from '@/components/shared/ButtonToggleIcon';
import {
  BiArchiveIn,
  BiSolidArchiveOut,
  BsCheckLg,
  BsPencilFill,
  GiMeeple,
  ImStarEmpty,
  ImStarFull,
} from '@/components/shared/Icons';
import { assertsIsDefined } from '@/helpers/assets';
import { generateUuidv4 } from '@/helpers/string';
import { useToggle } from '@/hooks/useToggle';

export default function NewPlayer() {
  const navigate = useNavigate();
  const [favorite, toggleFavorite] = useToggle(false);
  const [archive, toggleArchive] = useToggle(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit: FormSubmitEventHandler = async (e) => {
    e.preventDefault();
    const player = new FormData(e.currentTarget);
    player.append('id', generateUuidv4());
    player.append('avatar', '/assets/images/defaultAvatar.webp');
    player.append('isFavorite', favorite ? 'true' : 'false');
    player.append('isArchived', archive ? 'true' : 'false');

    LS.addPlayer(Object.fromEntries(player) as Player);

    navigate(-1);
  };

  useEffect(() => {
    assertsIsDefined(inputRef.current);

    inputRef.current.focus();
  }, []);

  return (
    <main className="">
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonToggleIcon
            condition={favorite}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={toggleFavorite}
            aria-label='Toggle Favorite'
          />
          <ButtonToggleIcon
            condition={archive}
            icons={[BiArchiveIn, BiSolidArchiveOut]}
            onClick={toggleArchive}
            aria-label='Toggle Archive'
          />
          <ButtonIcon
            icon={BsCheckLg}
            type="submit"
            aria-label="Save the Player"
          />
        </HeaderOptions>

        <div className="relative mb-3 flex w-full flex-wrap items-stretch">
          <BsPencilFill className="absolute z-10 h-full w-8 items-center justify-center rounded py-3 pl-3 text-center text-base font-normal leading-snug text-slate-600" />
          <input
            ref={inputRef}
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
        <NavLink className="mx-auto mt-3 block w-[200px]" to="#">
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
