export const APP_CONST = {
  title: '7 Wonders: Assistant',
  version: '0.2.0',
  tips_link: 'https://streamlabs.com/mike_dreeman/tip'
};

export const EXTENSIONS = [
  'leaders',
  'cities',
  'babel',
  'armada',
  'edifice',
] as const;

export const CATEGORIES = [
  'military',
  'treasury',
  'wonders',
  'civilians',
  'scientifics',
  'commercials',
  'guilds',
  'armada',
  'leaders',
  'cities',
] as const;

export const LS_KEY = {
  players: 'players',
};

export const CATEG: Record<Category, CategoryProperties> = {
  military: {
    className: 'bg-red-500',
    bgColor: 'rgb(239 68 68 / 0.7)',
    borderColor: 'rgb(239 68 68 / 1)',
    isExtension: false,
  },
  treasury: {
    className: 'bg-yellow-500',
    bgColor: 'rgb(234 179 8 / 0.7)',
    borderColor: 'rgb(234 179 8 / 1)',
    isExtension: false,
  },
  wonders: {
    className: 'bg-stone-500',
    bgColor: 'rgb(120 113 108 / 0.7)',
    borderColor: 'rgb(120 113 108 / 1)',
    isExtension: false,
  },
  civilians: {
    className: 'bg-blue-500',
    bgColor: 'rgb(59 130 246 / 0.7)',
    borderColor: 'rgb(59 130 246 / 1)',
    isExtension: false,
  },
  commercials: {
    className: 'bg-yellow-500',
    bgColor: 'rgb(234 179 8 / 0.7)',
    borderColor: 'rgb(234 179 8 / 1)',
    isExtension: false,
  },
  scientifics: {
    className: 'bg-green-500',
    bgColor: 'rgb(34 197 94 / 0.7)',
    borderColor: 'rgb(34 197 94 / 1)',
    isExtension: false,
  },
  guilds: {
    className: 'bg-purple-500',
    bgColor: 'rgb(168 85 247 / 0.7)',
    borderColor: 'rgb(168 85 247 / 1)',
    isExtension: false,
  },
  armada: {
    className: 'bg-cyan-500',
    bgColor: 'rgb(6 182 212 / 0.7)',
    borderColor: 'rgb(6 182 212 / 1)',
    isExtension: true,
  },
  leaders: {
    className: 'bg-slate-200',
    bgColor: 'rgb(226 232 240 / 0.7)',
    borderColor: 'rgb(226 232 240 / 1)',
    isExtension: true,
  },
  cities: {
    className: 'bg-slate-800',
    bgColor: 'rgb(30 41 59 / 0.7)',
    borderColor: 'rgb(30 41 59 / 1)',
    isExtension: true,
  },
};

/**
 * Represents the properties of a category.
 */
type CategoryProperties = {
  className: string;
  bgColor: string;
  borderColor: string;
  isExtension: boolean;
};
