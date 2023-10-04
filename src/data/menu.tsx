import {
  AiFillClockCircle,
  AiFillQuestionCircle,
  BiSolidStarHalf,
  BiSupport,
  FaPlus,
  GiCoffeeCup,
  GiMeeple,
  ImStatsBars,
  IoMdSettings,
} from '@/components/shared/Icons';

export const menuPages: MenuItem[] = [
  {
    icon: FaPlus,
    label: 'New Game',
    href: '/',
  },
  {
    icon: ImStatsBars,
    label: 'Statistics',
    href: '/statistics',
  },
  {
    icon: AiFillClockCircle,
    label: 'Games History',
    href: '/history',
  },
  {
    icon: GiMeeple,
    label: 'Players Management',
    href: '/players',
  },
  {
    icon: IoMdSettings,
    label: 'Settings',
    href: '/settings',
  },
  {
    icon: BiSupport,
    label: 'Feedback & Support',
    href: '/feedback',
  },
  {
    icon: BiSolidStarHalf,
    label: 'Rate Us',
    href: 'http://www.google.fr',
  },
  {
    icon: AiFillQuestionCircle,
    label: 'About',
    href: '/about',
  },
  {
    icon: GiCoffeeCup,
    label: 'Support Us',
    href: '/support',
  },
  //! /!\ TEST /!\
  {
    icon: GiCoffeeCup,
    label: 'Import Image',
    href: '/test/import',
  },
  {
    icon: GiCoffeeCup,
    label: 'Crop Image',
    href: '/test/crop',
  },
  {
    icon: GiCoffeeCup,
    label: 'Camera Image',
    href: '/test/camera',
  },
  {
    icon: GiCoffeeCup,
    label: 'Gallery Images',
    href: '/test/gallery',
  },
];

export const otherPages: PageItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'New player',
    href: '/players/new',
    previous: '/players',
  },
  {
    label: 'Edit player',
    href: '/players/edit',
    previous: '/players',
  },
  {
    label: 'Album',
    href: '/players/album',
    previous: '/players/new',
  },
];
