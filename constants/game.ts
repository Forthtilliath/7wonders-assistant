export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 7;

/** Médailles affichées pour les trois premières places (classement, partage). */
export const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/** Points saisis par catégorie, en positif comme en négatif : bien au-delà d'une vraie partie. */
export const MAX_POINTS = 10_000;

/**
 * Symboles de sciences par compteur (et jetons par valeur) : au-delà, la répartition optimale des
 * jokers (boucle quadratique, lib/scoring/science.ts) deviendrait assez coûteuse pour geler l'app.
 */
export const MAX_SCIENCE_SYMBOLS = 99;
