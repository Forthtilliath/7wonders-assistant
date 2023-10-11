import { memo, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import type { Player } from '@types';
import { GiCrossedSwords, ImStarFull } from '@components/shared/Icons';
import { cn } from '@helpers';

type Props = PropsWithClassname<
  ButtonLinkProps &
    Player & {
      showInGame?: boolean;
      showFavorite?: boolean;
      classNameH2?: string;
    }
>;

const MemoizedConditionalButtonLink = memo(ConditionalButtonLink);

export function CardPlayer({
  avatar,
  name,
  isFavorite,
  showFavorite,
  showInGame,
  onClick,
  href,
  className,
  classNameH2,
}: Props) {
  showFavorite &&= isFavorite === 'true';

  return (
    <MemoizedConditionalButtonLink
      onClick={onClick}
      href={href}
      className={className}>
      <img
        src={avatar}
        alt={`Avatar ${name}`}
        className="h-full w-full object-fill"
      />
      <h2
        className={cn(
          'text-xl/1 absolute bottom-0 w-full truncate bg-black/50 p-px text-center font-medium sm:p-1',
          classNameH2
        )}>
        {name}
      </h2>
      {showFavorite && (
        <ImStarFull
          className="absolute right-1 top-1 text-wonders-yellow sm:right-2 sm:top-2"
          size="30%"
        />
      )}
      {showInGame && (
        <GiCrossedSwords
          className="absolute left-1 top-1 text-red-500 sm:left-2 sm:top-2"
          size="20%"
        />
      )}
    </MemoizedConditionalButtonLink>
  );
}

function ConditionalButtonLink({
  children,
  onClick,
  href,
  className,
}: PropsWithChildren<PropsWithClassname<ButtonLinkProps>>) {
  const commonClassName = cn(
    'relative aspect-square h-auto w-full max-w-[250px] overflow-hidden rounded',
    className
  );

  if (href) {
    return (
      <Link to={href} className={commonClassName}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={commonClassName}>
        {children}
      </button>
    );
  }

  return <div className={commonClassName}>{children}</div>;
}
