import { Link } from 'react-router-dom';
import { IconOnly } from '@components/shared';
import { FaPlus } from '@components/shared/Icons';

export function ButtonNewPlayer() {
  return (
    <Link
      to="/players/new"
      className="flex aspect-square h-auto max-w-[250px] items-center justify-center rounded bg-slate-700">
      <IconOnly icon={FaPlus} size="70%" label="Add a player" />
    </Link>
  );
}
