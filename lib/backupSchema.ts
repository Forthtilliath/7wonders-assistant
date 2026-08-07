import { z } from "zod";
import type { Game, Player } from "@/types/game";

export const APP_ID = "7wonders-assistant";

/**
 * Version du format de sauvegarde JSON (indépendante des `version` de persistance Zustand).
 * À incrémenter à chaque changement de forme de `Player`/`Game`/`PlayerGameEntry`, et ajouter une
 * étape dans `MIGRATIONS` ci-dessous pour convertir l'étape précédente vers la nouvelle.
 *
 * Contrairement à la V1 Capacitor (`convertDataVersion.ts`), où ce système avait été esquissé
 * (un type par version, une fonction de conversion) mais jamais réellement branché ni implémenté
 * (la fonction recalculait la version cible sans transformer les données, et n'était même pas
 * appelée au chargement), les étapes ci-dessous sont réellement exécutées à l'import.
 */
export const DATA_VERSION = 1;

export type BackupData = {
	app: typeof APP_ID;
	dataVersion: number;
	exportedAt: number;
	players: Player[];
	history: Game[];
};

export class ImportError extends Error {}

/**
 * Une étape convertit les données de la version `from` vers `from + 1`. Aucune étape n'existe
 * encore : ce fichier est la toute première version du format exporté, il n'y a donc rien à migrer
 * pour l'instant. Exemple pour une future version 2 :
 *
 *   2: (data) => ({
 *     ...data,
 *     dataVersion: 2,
 *     players: data.players.map((p) => ({ ...p, nouveauChamp: valeurParDefaut })),
 *   }),
 */
const MIGRATIONS: Record<number, (data: BackupData) => BackupData> = {};

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

const extensionIdSchema = z.enum(["leaders", "cities", "armada"]);

const playerSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	avatarUri: z.string().optional(),
	isFavorite: z.boolean(),
	isArchived: z.boolean(),
	createdAt: z.number(),
});

const pointsSchema = z.object({ points: z.number() });

const scienceInputSchema = z.object({
	compass: z.number(),
	tablet: z.number(),
	gear: z.number(),
	wildcards: z.number(),
	maxSymbols: z.number(),
});

const playerGameEntrySchema = z.object({
	playerId: z.string().min(1),
	military: pointsSchema,
	treasury: pointsSchema,
	wonder: z.object({ name: z.string(), side: z.enum(["A", "B"]).nullable() }),
	wonders: pointsSchema,
	civilians: pointsSchema,
	commercials: pointsSchema,
	scientifics: scienceInputSchema,
	guilds: pointsSchema,
	leaders: pointsSchema,
	cities: pointsSchema,
	armada: pointsSchema,
});

const gameSchema = z.object({
	id: z.string().min(1),
	createdAt: z.number(),
	finishedAt: z.number().optional(),
	extensions: z.array(extensionIdSchema),
	playerIds: z.array(z.string()),
	entries: z.record(z.string(), playerGameEntrySchema),
});

/** Schéma complet (contenu de chaque joueur/partie compris), appliqué après migration. */
const backupDataSchema = z.object({
	app: z.literal(APP_ID),
	dataVersion: z.number(),
	exportedAt: z.number(),
	players: z.array(playerSchema),
	history: z.array(gameSchema),
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
