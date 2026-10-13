const formatter = new Intl.DateTimeFormat("fr-FR", {
	day: "2-digit",
	month: "long",
	year: "numeric",
});

export function formatDate(timestamp: number): string {
	return formatter.format(new Date(timestamp));
}
