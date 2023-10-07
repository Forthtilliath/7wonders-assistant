import { IconProps } from '@/components/shared/Icons';

declare global {
  type Icon = (props: IconProps) => React.JSX.Element;
  type IconElement = React.JSX.Element;
  type IconComponent = (props: IconProps) => IconElement;

  type PropsWithClassname<T = unknown> = T & {
    className?: string;
  };
  type PropsWithParams<T = unknown> = T & {
    params: T;
  };

  type Callback = (...args: unknown[]) => void;
  type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

  type FormSubmitEventHandler = React.FormEventHandler<HTMLFormElement>;
  type InputChangeEventHandler = React.ChangeEventHandler<HTMLInputElement>;
  type ButtonClickEventHandler = React.MouseEventHandler<HTMLButtonElement>;

  type SaveScoreEventHandler = (idPlayer: string) => InputChangeEventHandler;
}

export {};
