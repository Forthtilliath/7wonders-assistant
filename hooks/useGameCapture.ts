import { useViewShare } from "@forthtilliath/react-native-kit/hooks/useViewShare";

/** Ce qui est partagé en image : le classement seul, ou le classement suivi des graphiques. */
export type CaptureTarget = "ranking" | "charts";

const DIALOG_TITLES: Record<CaptureTarget, string> = {
	ranking: "Partager le classement",
	charts: "Partager la partie",
};

/** L'erreur remonte à l'appelant (qui l'affiche), plutôt que l'alerte par défaut du kit. */
function rethrow(error: unknown): never {
	throw error;
}

/**
 * Partage d'une partie en image, capturée dans `GameShareImages` (un `useViewShare` de
 * react-native-kit par cible). `capturing` indique la cible en cours de capture : l'écran garde ces
 * images montées tant qu'il est vrai.
 */
export function useGameCapture() {
	const ranking = useViewShare({ dialogTitle: DIALOG_TITLES.ranking, onError: rethrow });
	const charts = useViewShare({ dialogTitle: DIALOG_TITLES.charts, onError: rethrow });

	const capturing: CaptureTarget | null = ranking.capturing
		? "ranking"
		: charts.capturing
			? "charts"
			: null;

	const shareImage = (target: CaptureTarget) =>
		target === "ranking" ? ranking.share() : charts.share();

	return { rankingRef: ranking.ref, chartsRef: charts.ref, capturing, shareImage };
}
