type Props = Parameters<IconComponent>[0] & {
  icon: IconComponent;
  label: string;
};

export function IconOnly({ icon: Icon, label, ...iconProps }: Props) {
  return (
    <>
      <Icon {...iconProps} />
      <span className="sr-only">{label}</span>
    </>
  );
}
