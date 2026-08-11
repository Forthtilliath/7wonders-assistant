import { APP_INFO } from "@/constants/app";

const REPO = "Forthtilliath/7wonders-assistant";

export type UpdateCheckResult =
	| { status: "up-to-date" }
	| { status: "update-available"; version: string; url: string }
	| { status: "error" };

/** Compare deux versions "x.y.z" : true si `a` est strictement plus récente que `b`. */
function isNewer(a: string, b: string): boolean {
	const partsA = a.split(".").map(Number);
	const partsB = b.split(".").map(Number);
	for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
		const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
		if (diff !== 0) return diff > 0;
	}
	return false;
}

/**
 * Interroge la dernière release GitHub et la compare à la version installée (APP_INFO.version,
 * lue depuis package.json). Renvoie l'URL de la page de release plutôt que celle de l'APK
 * directement : plus robuste si le nombre/nom des assets change d'une release à l'autre, et ça
 * laisse l'utilisateur lire les nouveautés avant de télécharger.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
	try {
		// Paramètre anti-cache : le client HTTP Android (OkHttp) peut mettre en cache disque une
		// réponse 404 (ex. avant que le dépôt ne devienne public) et la reservir indéfiniment pour
		// une URL identique, même après que la ressource existe réellement.
		const response = await fetch(
			`https://api.github.com/repos/${REPO}/releases/latest?_=${Date.now()}`,
		);
		if (!response.ok) return { status: "error" };
		const data = await response.json();
		const latestVersion = String(data.tag_name ?? "").replace(/^v/, "");
		if (!latestVersion || !isNewer(latestVersion, APP_INFO.version)) {
			return { status: "up-to-date" };
		}
		return {
			status: "update-available",
			version: latestVersion,
			url: data.html_url ?? `https://github.com/${REPO}/releases/latest`,
		};
	} catch {
		return { status: "error" };
	}
}
