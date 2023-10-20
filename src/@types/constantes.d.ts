import { CATEGORIES, EXTENSIONS } from '@constants';

declare global {
  type Extension = (typeof EXTENSIONS)[number];
  type Category = (typeof CATEGORIES)[number];
}

export {};
