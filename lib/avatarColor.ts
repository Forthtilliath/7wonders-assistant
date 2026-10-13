// Pigments antiques (terres, ocres, malachite, lapis, pourpre de Tyr…), assez soutenus pour se
// détacher du papyrus comme du basalte ; les initiales choisissent ivoire ou encre selon le fond.
// 18 teintes réparties sur tout le cercle chromatique pour que deux joueurs distincts se
// ressemblent moins souvent, même dans un groupe nombreux. Garder ce nombre : chaque joueur
// conserve ainsi sa position de teinte d'une palette à l'autre.
const AVATAR_PALETTE = [
	"#b23a2e", // cinabre
	"#c0612b", // terre cuite
	"#b7812a", // ocre
	"#9c7a1c", // or vieilli
	"#6f7d2a", // olive
	"#4a7a3a", // vert de feuille
	"#2f7a5c", // malachite
	"#2a7470", // turquoise
	"#2b7488", // bleu égyptien clair
	"#2f6a9a", // bleu égyptien
	"#2c4f8f", // lapis-lazuli
	"#3d3f86", // indigo
	"#5b3f86", // améthyste
	"#6e2f7a", // pourpre de Tyr
	"#8a2f6a", // garance
	"#a23a5a", // grenade
	"#8f2f3a", // grenat
	"#6b5d4f", // basalte (neutre, pour varier des teintes vives)
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
