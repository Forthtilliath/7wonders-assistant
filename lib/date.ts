const formatter = new Intl.DateTimeFormat("fr-FR", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function formatDate(timestamp: number): string {
	return formatter.format(new Date(timestamp));
}

function startOfDay(timestamp: number): number {
	const date = new Date(timestamp);
	date.setHours(0, 0, 0, 0);
	return date.getTime();
}

/** Date d'une sauvegarde, relative quand elle est récente : "aujourd'hui à 21:42", "hier à…". */
export function formatBackupDate(timestamp: number | null, now: number = Date.now()): string {
	if (timestamp == null) return "jamais";

	const time = timeFormatter.format(new Date(timestamp));
	const dayDiff = Math.round((startOfDay(now) - startOfDay(timestamp)) / (24 * 60 * 60 * 1000));
	if (dayDiff <= 0) return `aujourd'hui à ${time}`;
	if (dayDiff === 1) return `hier à ${time}`;
	return `le ${formatDate(timestamp)}`;
}
