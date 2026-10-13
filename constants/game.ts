import type { ExtensionId } from "@/types/game";

export const MIN_PLAYERS = 2;
/** Joueurs maximum au jeu de base. */
export const BASE_MAX_PLAYERS = 7;
/** Joueurs maximum toutes extensions confondues (taille max d'un groupe). */
export const MAX_PLAYERS = BASE_MAX_PLAYERS + 1;

/** Joueurs maximum pour une partie : l'extension Cities ajoute une place (8 joueurs). */
export function getMaxPlayers(extensions: readonly ExtensionId[]): number {
	return extensions.includes("cities") ? BASE_MAX_PLAYERS + 1 : BASE_MAX_PLAYERS;
}

/** Médailles affichées pour les trois premières places (classement, partage). */
export const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/** Points saisis par catégorie, en positif comme en négatif : bien au-delà d'une vraie partie. */
export const MAX_POINTS = 10_000;

/**
 * Symboles de sciences par compteur (et jetons par valeur) : au-delà, la répartition optimale des
 * jokers (boucle quadratique, lib/scoring/science.ts) deviendrait assez coûteuse pour geler l'app.
 */
export const MAX_SCIENCE_SYMBOLS = 99;
