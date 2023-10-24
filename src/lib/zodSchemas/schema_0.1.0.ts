import { z } from 'zod';

const extensionsEnum = z.enum([
  'leaders',
  'cities',
  'babel',
  'armada',
  'edifice',
]);

const settingsSchema = z.object({
  extensions: z.array(extensionsEnum),
  language: z.enum(['fr', 'en']),
  version: z.literal('0.1.0'),
});

const playerSchema = z.object({
  idPlayer: z.number(),
  name: z.string().trim().min(1),
  avatar: z.string().startsWith('/assets/images/'),
  isFavorite: z.boolean(),
  isArchived: z.boolean(),
});

const gameSchema = z.object({
  idGame: z.number(),
  createdAt: z.number(),
  Leaders: z.boolean(),
  Cities: z.boolean(),
  Babel: z.boolean(),
  Armada: z.boolean(),
  Edifice: z.boolean(),
});

const scoresSchema = z.object({
  idGame: z.number(),
  idPlayer: z.number(),
  total: z.number().min(0),
  ranking: z.number().min(1).max(8),
  military: z.number(),
  treasury: z.number(),
  wonders: z.number().min(0),
  civilians: z.number().min(0),
  scientifics: z.number().min(0),
  commercials: z.number().min(0),
  guilds: z.number().min(0),
  leaders: z.number().min(0).optional(),
  cities: z.number().min(0).optional(),
  armada: z.number().min(0).optional(),
});

const historySchema = z.object({
  game: gameSchema,
  scores: z.array(scoresSchema),
});

export const dataSchema_v0_1_0 = z.object({
  settings: settingsSchema,
  players: z.array(playerSchema),
  history: z.array(historySchema),
});
