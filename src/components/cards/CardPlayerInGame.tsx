import { cn } from '@/helpers/tailwind';

type Props = PropsWithClassname<Player>;

export function CardPlayerInGame({ avatar, name, className }: Props) {
  return (
    <div
      className={cn(
        'relative aspect-square h-auto w-full max-w-[250px] overflow-hidden rounded',
        className
      )}>
      <img
        src={avatar}
        alt={`Avatar ${name}`}
        className="h-full w-full object-fill"
      />
      <h2 className="absolute bottom-0 w-full truncate bg-black/50 p-1 text-center text-xs font-normal">
        {name}
      </h2>
    </div>
  );
}
