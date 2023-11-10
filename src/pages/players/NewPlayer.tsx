import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeaderOptions, Section } from '@components/layout';
import { ButtonIcon, ButtonToggleIcon } from '@components/shared';
import {
  BiArchiveIn,
  BiSolidArchiveOut,
  BsCheckLg,
  GiMeeple,
  ImStarEmpty,
  ImStarFull,
} from '@components/shared/Icons';
import { PlayerInput } from '@components/ui';
import { getInputValue } from '@helpers';
import { createPlayer } from '@lib';
import { useToggle } from '@hooks';

export default function NewPlayer() {
  const navigate = useNavigate();
  const [isFavorite, toggleFavorite] = useToggle(false);
  const [isArchived, toggleArchived] = useToggle(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit: FormSubmitEventHandler = async (e) => {
    e.preventDefault();

    const name = getInputValue(e, 'name');

    if (!name) {
      // ERROR Empty Name
      return;
    }

    const player = {
      name,
      avatar: '/assets/images/defaultAvatar.webp',
      isFavorite,
      isArchived,
      isDeleted: false,
    };

    await createPlayer(player);

    navigate(-1);
  };

  useEffect(() => inputRef.current?.focus(), []);

  return (
    <main>
      <form onSubmit={onSubmit}>
        <HeaderOptions>
          <ButtonToggleIcon
            condition={isFavorite}
            icons={[ImStarEmpty, ImStarFull]}
            onClick={toggleFavorite}
            aria-label="Toggle Favorite"
          />
          <ButtonToggleIcon
            condition={isArchived}
            icons={[BiArchiveIn, BiSolidArchiveOut]}
            onClick={toggleArchived}
            aria-label="Toggle Archive"
          />
          <ButtonIcon
            icon={BsCheckLg}
            type="submit"
            aria-label="Save the Player"
          />
        </HeaderOptions>

        <Section className="p-0">
          <PlayerInput ref={inputRef} />

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
        </Section>
      </form>
    </main>
  );
}
