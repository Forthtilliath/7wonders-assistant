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

  type Callback = (...args: any[]) => void;
  type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

  type FormSubmitEvent = React.FormEventHandler<HTMLFormElement>;
  type InputChangeEvent = React.ChangeEventHandler<HTMLInputElement>;
  type ButtonClickEvent = React.MouseEventHandler<HTMLButtonElement>;
}

export {};
