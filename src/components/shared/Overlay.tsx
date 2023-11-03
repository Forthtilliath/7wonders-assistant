type Props = {
  onClick?: () => void;
};

export function Overlay({ onClick = () => {} }: Props) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/60"
      tabIndex={-1}
      onClick={onClick}
    />
  );
}
