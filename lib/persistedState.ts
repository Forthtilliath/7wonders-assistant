import { keepRescueCopy } from "@/lib/rescueCopies";
import { reportDataIssue } from "@/stores/dataIssuesStore";

/**
 * Conversions d'un store persisté : `steps[v]` transforme l'état enregistré en version `v` en état
 * de la version `v + 1`. Toute hausse de version d'un store ajoute son étape, jamais d'effacement :
 * un test vérifie qu'aucune ne manque (stores/__tests__/storeMigrations.test.ts).
 */
export type MigrationSteps = Readonly<Record<number, (state: unknown) => unknown>>;

/**
 * Applique les étapes une à une de `from` à `to` : un utilisateur qui a sauté des mises à jour
 * passe par toutes. Lève une erreur si une étape manque ou si `from` est plus récente que `to`.
 */
export function runMigrationSteps(
	state: unknown,
	from: number,
	to: number,
	steps: MigrationSteps,
): unknown {
	if (from > to) throw new Error(`version ${from} plus récente que ${to}`);
	let migrated = state;
	for (let version = from; version < to; version++) {
		const step = steps[version];
		if (!step) throw new Error(`aucune migration de la version ${version} à ${version + 1}`);
		migrated = step(migrated);
	}
	return migrated;
}

/**
 * Option `migrate` du middleware `persist` de Zustand. L'état enregistré est d'abord copié tel quel
 * (lib/rescueCopies), puis converti étape par étape. Si la conversion est impossible, le store
 * démarre vide, mais la copie garde les données et l'utilisateur est prévenu : rien n'est jamais
 * effacé en silence.
 *
 * `report: false` pour les réglages propres à l'appareil (thème, rappel…) : sans conversion
 * possible, ils reviennent à leur valeur par défaut, sans copie ni alerte.
 */
export function createStoreMigrate<S>(
	storeName: string,
	currentVersion: number,
	steps: MigrationSteps,
	emptyState: S,
	{ report = true }: { report?: boolean } = {},
) {
	return (persisted: unknown, version: number): S => {
		if (version === currentVersion || persisted === undefined || persisted === null) {
			return (persisted ?? emptyState) as S;
		}
		const copy = report ? keepRescueCopy(storeName, version, persisted) : null;
		try {
			return runMigrationSteps(persisted, version, currentVersion, steps) as S;
		} catch {
			if (copy) {
				reportDataIssue({
					storeName,
					kind: version > currentVersion ? "newer" : "migration",
					copyUri: copy.uri,
				});
			}
			return emptyState;
		}
	};
}
