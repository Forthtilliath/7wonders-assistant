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
        'p-5 flex items-center justify-between text-center bg-wonders-blue-dark gap-4 rounded-md',
        className
      )}
      rel="noopener noreferrer"
      target="_blank">
      <img
        className={cn('rounded-full w-20', classNameImg)}
        src={avatar}
        alt={`Avatar ${name}`}
      />
      <h2 className={cn('text-lg w-full', classNameH2)}>{name}</h2>
    </a>
  );
}
