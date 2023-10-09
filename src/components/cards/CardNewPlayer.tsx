import { Link } from 'react-router-dom';

import { IconOnly } from '../shared/IconOnly';
import { FaPlus } from '../shared/Icons';

export function CardNewPlayer() {
  return (
    <Link
      to="/players/new"
      className="flex aspect-square h-auto max-w-[250px] items-center justify-center rounded bg-slate-700">
      <IconOnly icon={FaPlus} size="5rem" label="Add a player" />
    </Link>
  );
}
