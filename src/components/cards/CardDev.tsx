type Props = {
  href: string;
  // TODO: Fix type
  avatar: string;
  name: string;
};

export function CardDev({ href, avatar, name }: Props) {
  return (
    <a
      href={href}
      className="p-5 flex flex-col gap-4 justify-center items-center text-center border-2 rounded"
    >
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
