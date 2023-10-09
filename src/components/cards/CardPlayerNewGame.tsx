import type { Player } from '@/@types/storage';

import { GiCrossedSwords } from '../shared/Icons';

type Props = Player & {
  onClick: ButtonClickEventHandler;
  inGame?: boolean;
};

export function CardPlayerNewGame({ avatar, name, inGame, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square h-auto w-full max-w-[250px] overflow-hidden rounded">
      <img
        src={avatar}
        alt={`Avatar ${name}`}
        className="h-full w-full object-fill"
      />
      <h2 className="absolute bottom-0 w-full truncate rounded bg-black/50 p-1 text-center text-xl font-medium">
        {name}
      </h2>
      {inGame && (
        <GiCrossedSwords
          className="absolute left-1 top-1 text-red-500 shadow-sm"
          size={'20%'}
        />
      )}
    </button>
  );
}
