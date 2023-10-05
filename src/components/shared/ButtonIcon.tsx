type Props = React.ComponentPropsWithoutRef<'button'> & {
  icon: Icon;
  alternateIcon?: Icon;
  onClick?: ButtonClickEventHandler;
};

export function ButtonIcon({ icon: Icon, onClick, ...buttonProps }: Props) {
  return (
    <button
      className="m-4 text-2xl font-medium"
      onClick={onClick}
      type="button"
      {...buttonProps}>
      <Icon size={'1.5rem'} />
    </button>
  );
}
