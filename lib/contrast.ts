/** Luminance relative WCAG d'une couleur `#rrggbb` (0 = noir, 1 = blanc). */
export function relativeLuminance(hex: string): number {
	const value = Number.parseInt(hex.slice(1, 7), 16);
	const channels = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Rapport de contraste WCAG entre deux couleurs `#rrggbb` (de 1 à 21). */
export function contrastRatio(a: string, b: string): number {
	const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

/** Celle des deux couleurs de texte la plus lisible sur `background` (ex. encre ou ivoire sur une
 * couleur de catégorie, qui va du jaune pièce d'or au bleu nuit). */
export function pickReadableText(background: string, light: string, dark: string): string {
	return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}
