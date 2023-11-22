import { Params } from 'react-router-dom';
import { IconProps } from '@components/shared/Icons';

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
  type ButtonLinkProps = {
    onClick?: ButtonClickEventHandler;
    href?: string;
  };

  type Callback = (...args: unknown[]) => void;
  type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

  type FormSubmitEventHandler = React.FormEventHandler<HTMLFormElement>;
  type InputChangeEventHandler = React.ChangeEventHandler<HTMLInputElement>;
  type ButtonClickEventHandler = React.MouseEventHandler<HTMLButtonElement>;
  type DivClickEventHandler = React.MouseEventHandler<HTMLDivElement>;

  type SaveScoreEventHandler = (idPlayer: number) => InputChangeEventHandler;

  type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

  type LoaderParams<T extends string = string> = {
    params: Params<T>;
  };
  type LoaderData<Loader extends ({ params }: LoaderParams) => unknown> =
    Awaited<ReturnType<Loader>>;

  type ReadonlyObject<T extends string = ''> = Readonly<Record<T, number>>;
}

export {};
