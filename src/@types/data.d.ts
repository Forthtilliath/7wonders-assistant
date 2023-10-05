type MenuItem =  {
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
  previous?: string;
  children?: Route[];
};

type Metadata = Readonly<{
  title: string;
  description: string;
}>;
