import { Link } from 'react-router-dom';

import type { Player } from '@/@types/storage';

import { ImStarFull } from '../shared/Icons';

type Props = Player;

export function CardPlayer({ id, avatar, name, isFavorite }: Props) {
  return (
    <Link
      to={`/players/edit?id=${id}`}
      className="relative aspect-square h-auto w-full max-w-[250px] overflow-hidden rounded">
      <img
        src={avatar}
        alt={`Avatar ${name}`}
        className="h-full w-full object-fill"
      />
      <h2 className="absolute bottom-0 w-full truncate bg-black/50 p-1 text-center text-xl font-medium">
        {name}
      </h2>
      {isFavorite === 'true' && (
        <ImStarFull
          className="absolute right-1 top-1 text-wonders-yellow shadow-sm"
          size={'1.5rem'}
        />
      )}
    </Link>
  );
}
