import { z } from "zod";
import { MAX_POINTS, MAX_SCIENCE_SYMBOLS, MIN_POINTS } from "@/constants/game";
import {
	MAX_CUSTOM_WONDERS,
	MAX_WONDER_NAME_LENGTH,
	MAX_WONDER_PACK_NAME_LENGTH,
	MAX_WONDER_PACKS,
} from "@/constants/wonders";
import { type LegacyArmadaEntry, renameArmadaCategoriesInEntries } from "@/lib/armadaMigration";
import { addBabelCategoryToEntries, type PreBabelEntry } from "@/lib/babelMigration";
import type { CustomWonder, CustomWonderPack, Game, Player, PlayerGroup } from "@/types/game";

export const APP_ID = "7wonders-assistant";

/**
 * Version du format de sauvegarde JSON (indépendante des `version` de persistance Zustand).
 * À incrémenter à chaque changement de forme de `Player`/`Game`/`PlayerGameEntry`/`PlayerGroup`, et
 * ajouter une étape dans `MIGRATIONS` ci-dessous pour convertir l'étape précédente vers la nouvelle.
 *
 * Contrairement à la V1 Capacitor (`convertDataVersion.ts`), où ce système avait été esquissé
 * (un type par version, une fonction de conversion) mais jamais réellement branché ni implémenté
 * (la fonction recalculait la version cible sans transformer les données, et n'était même pas
 * appelée au chargement), les étapes ci-dessous sont réellement exécutées à l'import.
 */
export const DATA_VERSION = 6;

export type BackupData = {
	app: typeof APP_ID;
	dataVersion: number;
	exportedAt: number;
	players: Player[];
	history: Game[];
	groups: PlayerGroup[];
	/** Photos des joueurs en JPEG base64, par id de joueur. Absent des sauvegardes plus anciennes, qui
	 * ne contenaient que l'URI locale de la photo (inutilisable sur un autre téléphone) : champ
	 * facultatif plutôt que nouvelle `DATA_VERSION`, une app plus ancienne importe ainsi toujours la
	 * sauvegarde, simplement sans les photos. */
	avatars?: Record<string, string>;
	/** Merveilles ajoutées par l'utilisateur. Facultatif pour la même raison que `avatars` : absent des
	 * sauvegardes plus anciennes, et ignoré sans erreur par une app plus ancienne. */
	customWonders?: CustomWonder[];
	/** Extensions non officielles de l'utilisateur. Facultatif pour la même raison. */
	customWonderPacks?: CustomWonderPack[];
};

export class ImportError extends Error {}

/**
 * Une étape convertit les données de la version `from` vers `from + 1`.
 */
const MIGRATIONS: Record<number, (data: BackupData) => BackupData> = {
	// v1 -> v2 : ajout des groupes de joueurs, absents des sauvegardes plus anciennes.
	1: (data) => ({
		...data,
		dataVersion: 2,
		groups: [],
	}),
	// v2 -> v3 : ajout de isFavorite/isArchived sur les groupes.
	2: (data) => ({
		...data,
		dataVersion: 3,
		groups: data.groups.map((g) => ({ ...g, isFavorite: false, isArchived: false })),
	}),
	// v3 -> v4 : ajout de la catégorie "islands" (Îles + plateau Armada), distincte des jetons
	// maritimes, sur chaque saisie de chaque partie de l'historique.
	3: (data) => ({
		...data,
		dataVersion: 4,
		history: data.history.map((game) => ({
			...game,
			entries: Object.fromEntries(
				Object.entries(game.entries).map(([id, entry]) => [
					id,
					{ ...entry, islands: { points: 0 } },
				]),
			),
		})),
	}),
	// v4 -> v5 : renommage des catégories Armada, "armada" (jetons navals) devient "naval" et
	// "islands" (plateau + Îles) devient "armada", comme les onglets Maritime et Armada.
	4: (data) => ({
		...data,
		dataVersion: 5,
		history: data.history.map((game) => ({
			...game,
			entries: renameArmadaCategoriesInEntries(
				game.entries as unknown as Record<string, LegacyArmadaEntry>,
			),
		})),
	}),
	// v5 -> v6 : ajout de la catégorie Babel (tuiles posées), à zéro pour les parties existantes.
	5: (data) => ({
		...data,
		dataVersion: 6,
		history: data.history.map((game) => ({
			...game,
			entries: addBabelCategoryToEntries(game.entries as unknown as Record<string, PreBabelEntry>),
		})),
	}),
};

export function migrateBackupData(data: BackupData): BackupData {
	let current = data;
	while (current.dataVersion < DATA_VERSION) {
		const migrate = MIGRATIONS[current.dataVersion];
		if (!migrate) {
			// Ne devrait pas arriver tant que MIGRATIONS couvre bien chaque version < DATA_VERSION.
			throw new ImportError(
				`Impossible de migrer cette sauvegarde depuis la version ${current.dataVersion}.`,
			);
		}
		current = migrate(current);
	}
	return current;
}

/** Valide la forme minimale attendue d'un fichier de sauvegarde, sans vérifier chaque entrée. */
export function isBackupDataShape(data: unknown): data is BackupData {
	if (typeof data !== "object" || data === null) return false;
	const d = data as Partial<BackupData>;
	return (
		d.app === APP_ID &&
		typeof d.dataVersion === "number" &&
		Array.isArray(d.players) &&
		Array.isArray(d.history)
	);
}

const extensionIdSchema = z.enum(["leaders", "cities", "babel", "armada", "edifice"]);

// Bornes de chaque champ importé : un fichier modifié à la main ne doit ni faire planter l'app, ni la
// geler (les compteurs de sciences pilotent des boucles, voir lib/scoring/science.ts), ni remplir le
// stockage. Larges par rapport à une vraie partie, pour ne jamais refuser une sauvegarde légitime.
/** Une vignette de 256 px fait quelques dizaines de Ko en base64 : 1 Mo laisse une large marge. */
const MAX_AVATAR_BASE64_LENGTH = 1_000_000;

const idSchema = z.string().min(1).max(64);
const nameSchema = z.string().min(1).max(100);
const timestampSchema = z.number().int().nonnegative();

const playerSchema = z.object({
	id: idSchema,
	name: nameSchema,
	avatarUri: z.string().max(2048).optional(),
	isFavorite: z.boolean(),
	isArchived: z.boolean(),
	createdAt: timestampSchema,
});

const pointsSchema = z.object({ points: z.number().int().min(MIN_POINTS).max(MAX_POINTS) });

const symbolCountSchema = z.number().int().min(0).max(MAX_SCIENCE_SYMBOLS);

const scienceInputSchema = z.object({
	compass: symbolCountSchema,
	tablet: symbolCountSchema,
	gear: symbolCountSchema,
	wildcards: symbolCountSchema,
	maxSymbols: symbolCountSchema,
});

const playerGameEntrySchema = z.object({
	playerId: idSchema,
	military: pointsSchema,
	treasury: pointsSchema,
	wonder: z.object({
		name: z.string().max(MAX_WONDER_NAME_LENGTH),
		side: z.enum(["A", "B"]).nullable(),
	}),
	wonders: pointsSchema,
	civilians: pointsSchema,
	commercials: pointsSchema,
	scientifics: scienceInputSchema,
	guilds: pointsSchema,
	leaders: pointsSchema,
	cities: pointsSchema,
	babel: z.object({ tiles: z.literal([0, 1, 2, 3]) }),
	naval: pointsSchema,
	armada: pointsSchema,
});

/** Objet indexé par id, au nombre d'entrées borné (`z.record` seul n'en limite pas le nombre). */
function boundedRecord<T extends z.ZodType>(value: T, maxEntries: number) {
	return z.record(idSchema, value).refine((record) => Object.keys(record).length <= maxEntries, {
		message: `${maxEntries} entrées au maximum`,
	});
}

const gameSchema = z.object({
	id: idSchema,
	createdAt: timestampSchema,
	finishedAt: timestampSchema.optional(),
	// Facultative : absente des parties enregistrées avant le choix de l'édition.
	edition: z.enum(["first", "second"]).optional(),
	extensions: z.array(extensionIdSchema).max(10),
	playerIds: z.array(idSchema).max(20),
	entries: boundedRecord(playerGameEntrySchema, 20),
});

const playerGroupSchema = z.object({
	id: idSchema,
	name: nameSchema,
	playerIds: z.array(idSchema).max(100),
	isFavorite: z.boolean(),
	isArchived: z.boolean(),
	createdAt: timestampSchema,
});

const customWonderSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(1).max(MAX_WONDER_NAME_LENGTH),
	packId: idSchema.optional(),
	createdAt: timestampSchema,
});

const customWonderPackSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(1).max(MAX_WONDER_PACK_NAME_LENGTH),
	enabled: z.boolean(),
	createdAt: timestampSchema,
});

/** Schéma complet (contenu de chaque joueur/partie/groupe compris), appliqué après migration. */
const backupDataSchema = z
	.object({
		app: z.literal(APP_ID),
		dataVersion: z.number().int(),
		exportedAt: timestampSchema,
		players: z.array(playerSchema).max(1000),
		history: z.array(gameSchema).max(100_000),
		groups: z.array(playerGroupSchema).max(1000),
		customWonders: z.array(customWonderSchema).max(MAX_CUSTOM_WONDERS).optional(),
		customWonderPacks: z.array(customWonderPackSchema).max(MAX_WONDER_PACKS).optional(),
		avatars: boundedRecord(
			z
				.string()
				.max(MAX_AVATAR_BASE64_LENGTH)
				.regex(/^[A-Za-z0-9+/]+={0,2}$/, "image base64 attendue"),
			1000,
		).optional(),
	})
	.superRefine((data, ctx) => {
		// Une merveille rangée dans une extension absente du fichier : sauvegarde incohérente.
		const packIds = new Set((data.customWonderPacks ?? []).map((p) => p.id));
		(data.customWonders ?? []).forEach((wonder, i) => {
			if (wonder.packId && !packIds.has(wonder.packId)) {
				ctx.addIssue({
					code: "custom",
					path: ["customWonders", i, "packId"],
					message: "extension inconnue",
				});
			}
		});
	});

/**
 * Valide en profondeur le contenu d'une sauvegarde déjà migrée vers `DATA_VERSION`. Rejette avec un
 * message précis (champ + raison) un fichier corrompu ou modifié à la main plutôt que de laisser
 * l'app planter au rendu sur une entrée mal formée.
 */
export function validateMigratedBackupData(data: BackupData): BackupData {
	const result = backupDataSchema.safeParse(data);
	if (!result.success) {
		const issue = result.error.issues[0];
		const path = issue.path.join(".") || "racine";
		throw new ImportError(`Sauvegarde corrompue (champ "${path}" : ${issue.message}).`);
	}
	return result.data;
}
