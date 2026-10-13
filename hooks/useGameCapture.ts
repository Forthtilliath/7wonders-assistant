import { shareViewAsImage } from "@forthtilliath/react-native-kit/utils/helpers/shareViewAsImage";
import { useRef, useState } from "react";
import type { View } from "react-native";

/** Ce qui est partagé en image : le classement seul, ou le classement suivi des graphiques. */
export type CaptureTarget = "ranking" | "charts";

const DIALOG_TITLES: Record<CaptureTarget, string> = {
	ranking: "Partager le classement",
	charts: "Partager la partie",
};

/** Attend que React ait rendu le dernier changement d'état et que le natif l'ait dessiné. */
function nextFrames() {
	return new Promise<void>((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
	);
}

/**
 * Partage d'une partie en image. `capturing` indique la cible en cours de capture, le temps que
 * l'écran lui pose son fond (voir `CaptureFrame`) et affiche les graphiques s'ils étaient masqués.
 */
export function useGameCapture() {
	const rankingRef = useRef<View>(null);
	const chartsRef = useRef<View>(null);
	const [capturing, setCapturing] = useState<CaptureTarget | null>(null);

	const shareImage = async (target: CaptureTarget) => {
		setCapturing(target);
		try {
			await nextFrames();
			await shareViewAsImage(target === "ranking" ? rankingRef : chartsRef, {
				dialogTitle: DIALOG_TITLES[target],
			});
		} finally {
			setCapturing(null);
		}
	};

	return { rankingRef, chartsRef, capturing, shareImage };
}
