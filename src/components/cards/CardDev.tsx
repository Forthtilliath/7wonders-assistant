type Props = {
  href: string;
  avatar: string;
  name: string;
};

export function CardDev({ href, avatar, name }: Props) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center gap-4 rounded border-2 p-5 text-center"
      rel="noopener noreferrer"
      target="_blank">
      <img
        className="rounded-full border-4"
        src={avatar}
        alt={`Avatar ${name}`}
        width={120}
      />
      <h2 className="text-lg">{name}</h2>
    </a>
  );
}
