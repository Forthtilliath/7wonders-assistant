type PageItem = {
  label: string;
  href: string;
  previous?: string;
};

type MenuItem = PageItem & {
  icon: IconComponent;
};

type Metadata = Readonly<{
  title: string;
  description: string;
}>;
