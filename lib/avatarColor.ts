// Palette de couleurs saturées, choisies pour rester lisibles avec du texte blanc dessus, aussi
// bien en thème sombre que clair.
const AVATAR_PALETTE = [
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#14b8a6",
	"#3b82f6",
	"#6366f1",
	"#a855f7",
	"#ec4899",
	"#84cc16",
] as const;

/**
 * Couleur de fond déterministe pour un avatar sans photo, dérivée d'un identifiant stable (l'id du
 * joueur si disponible, sinon son nom). Le même joueur garde toujours la même couleur, ce qui
 * facilite le repérage visuel dans les tableaux/graphiques multi-joueurs.
 */
export function getAvatarColor(seed: string): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 31 + seed.charCodeAt(i)) | 0;
	}
	return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
