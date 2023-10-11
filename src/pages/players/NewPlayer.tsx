import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BiArchiveIn,
  BiSolidArchiveOut,
  BsCheckLg,
  GiMeeple,
  ImStarEmpty,
  ImStarFull,
} from '@/components/shared/Icons';
import type { Player } from '@types';
import { HeaderOptions } from '@components/layout/HeaderOptions';
import { ButtonIcon, ButtonToggleIcon } from '@components/shared';
import { InputPlayer } from '@components/ui';
import { generateUuidv4 } from '@helpers';
import { LS } from '@lib';
import { useToggle } from '@hooks';

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
    player.append('isFavorite', favorite.toString());
    player.append('isArchived', archive.toString());

    const playerData = Object.fromEntries(player) as Player;
    LS.addPlayer(playerData);

    navigate(-1);
  };

  useEffect(() => inputRef.current?.focus(), []);

  return (
    <main className="">
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonToggleIcon
            condition={favorite}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={toggleFavorite}
            aria-label="Toggle Favorite"
          />
          <ButtonToggleIcon
            condition={archive}
            icons={[BiArchiveIn, BiSolidArchiveOut]}
            onClick={toggleArchive}
            aria-label="Toggle Archive"
          />
          <ButtonIcon
            icon={BsCheckLg}
            type="submit"
            aria-label="Save the Player"
          />
        </HeaderOptions>

        <InputPlayer ref={inputRef} />

        {/* NOTE: Si on change de page, on perd le form ! */}
        {/* Solution possible : Sidebar / Modal */}
        <p className="mt-10 text-center text-lg">Avatar</p>
        <NavLink className="mx-auto mt-3 block w-[200px]" to="#">
          <div className="flex h-[200px] w-full items-center justify-center bg-wonders-blue">
            <GiMeeple size="5rem" />
          </div>
          <div className="flex h-16 w-full items-center justify-center bg-wonders-blue-dark text-lg">
            Change
          </div>
        </NavLink>
      </form>
    </main>
  );
}
