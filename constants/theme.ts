/** Thème unique (sombre), dans l'esprit du plateau 7 Wonders. Pas de mode clair pour l'instant. */
export const COLORS = {
	background: "#0f172a",
	surface: "#1e293b",
	surfaceAlt: "#334155",
	border: "#475569",
	text: "#f1f5f9",
	textMuted: "#94a3b8",
	primary: "#3b82f6",
	primaryText: "#f8fafc",
	gold: "#eab308",
	danger: "#ef4444",
	success: "#22c55e",
} as const;

export const RADIUS = {
	sm: 8,
	md: 12,
	lg: 20,
	full: 999,
} as const;

export const SPACING = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
} as const;
