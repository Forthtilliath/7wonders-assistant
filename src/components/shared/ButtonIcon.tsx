import { cn } from "@/helpers/tailwind";

type Props = React.ComponentPropsWithoutRef<'button'> & {
  icon: Icon;
  alternateIcon?: Icon;
  className?: string;
  onClick?: ButtonClickEventHandler;
};

export function ButtonIcon({ icon: Icon, onClick, className, ...buttonProps }: Props) {
  return (
    <button
      className={cn("m-2 text-2xl font-medium", className)}
      onClick={onClick}
      type="button"
      {...buttonProps}>
      <Icon size={'1.5rem'} />
    </button>
  );
}
