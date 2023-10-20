import { cn } from '@helpers';

type Props = {
  href: string;
  avatar: string;
  name: string;
  className?: string;
  classNameImg?: string;
  classNameH2?: string;
};

export function CardDev({
  href,
  avatar,
  name,
  className,
  classNameImg,
  classNameH2,
}: Props) {
  return (
    <a
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded border-2 p-5 text-center',
        className
      )}
      rel="noopener noreferrer"
      target="_blank">
      <img
        className={cn('rounded-full w-full', classNameImg)}
        src={avatar}
        alt={`Avatar ${name}`}
      />
      <h2 className={cn('text-lg', classNameH2)}>{name}</h2>
    </a>
  );
}
