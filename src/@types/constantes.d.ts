import { APP_CONST, CATEGORIES, EXTENSIONS } from '@constants';

declare global {
  type Extension = (typeof EXTENSIONS)[number];
  type Category = (typeof CATEGORIES)[number];
  type CurrentVersion = APP_CONST.version
}

export {};
