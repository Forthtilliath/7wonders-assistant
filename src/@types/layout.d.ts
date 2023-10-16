import { LoaderFunction } from 'react-router-dom';

declare global {
  type MenuItem = {
    label: string;
    path: string;
    icon: IconComponent;
  };

  type HeaderTitle = {
    label: string;
    path: string;
    previous?: string;
  };

  type Route = {
    path: string;
    element?: React.ReactNode | null;
    icon?: IconComponent;
    label?: string;
    previous?: boolean;
    children?: Route[];
    loader?: LoaderFunction;
  };
}

export {};
