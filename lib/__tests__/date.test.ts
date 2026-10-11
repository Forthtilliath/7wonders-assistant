import { formatBackupDate, formatDate } from "../date";

describe("formatDate", () => {
	it("formate un timestamp en date longue française", () => {
		const timestamp = new Date(2026, 6, 14).getTime(); // 14 juillet 2026

		expect(formatDate(timestamp)).toBe("14 juillet 2026");
	});
});

describe("formatBackupDate", () => {
	const now = new Date(2026, 9, 11, 22, 0).getTime();

	it("affiche « jamais » sans sauvegarde", () => {
		expect(formatBackupDate(null, now)).toBe("jamais");
	});

	it("affiche l'heure pour une sauvegarde du jour même", () => {
		expect(formatBackupDate(new Date(2026, 9, 11, 9, 5).getTime(), now)).toBe(
			"aujourd'hui à 09:05",
		);
	});

	it("affiche « hier » pour la veille, même à moins de 24 h d'écart", () => {
		expect(formatBackupDate(new Date(2026, 9, 10, 23, 30).getTime(), now)).toBe("hier à 23:30");
	});

	it("affiche la date complète au-delà", () => {
		expect(formatBackupDate(new Date(2026, 9, 3, 12, 0).getTime(), now)).toBe("le 03 octobre 2026");
	});
});
