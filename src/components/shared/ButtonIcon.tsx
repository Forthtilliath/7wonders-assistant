import { cn } from '@helpers';

type Props = React.ComponentPropsWithoutRef<'button'> & {
  icon: Icon;
  alternateIcon?: Icon;
  className?: string;
  onClick?: ButtonClickEventHandler;
  size?: string;
};

export function ButtonIcon({
  icon: Icon,
  onClick,
  className,
  size = '1.5rem',
  children,
  ...buttonProps
}: Props) {
  return (
    <button
      className={cn('m-2 text-2xl font-medium pointer-events-auto', className)}
      onClick={onClick}
      type="button"
      {...buttonProps}>
      <Icon size={size} />
      {children}
    </button>
  );
}
