import { act } from "@testing-library/react-native";
import { Alert, type AlertButton } from "react-native";
import { initialBackupState, useBackupStore } from "@/stores/backupStore";
import { initialGameState, useGameStore } from "@/stores/gameStore";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useThemeStore } from "@/stores/themeStore";
import { initialUpdateState, useUpdateStore } from "@/stores/updateStore";
import { useWondersStore } from "@/stores/wondersStore";
import {
	createEmptyPlayerGameEntry,
	type ExtensionId,
	type Game,
	type Player,
	type PlayerGameEntry,
	type PlayerGroup,
} from "@/types/game";

/** Remet tous les stores dans l'état d'une installation neuve. */
export function resetAllStores() {
	usePlayersStore.setState({ players: [] });
	useGroupsStore.setState({ groups: [] });
	useHistoryStore.setState({ games: [] });
	useWondersStore.setState({ customWonders: [], packs: [] });
	useGameStore.setState({ ...initialGameState });
	useBackupStore.setState({ ...initialBackupState });
	usePreferencesStore.setState({ defaultExtensions: [], defaultEdition: "first" });
	useThemeStore.setState({ mode: "dark" });
	useUpdateStore.setState({ ...initialUpdateState });
}

export function makePlayer(id: string, name: string, patch: Partial<Player> = {}): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0, ...patch };
}

/** Ajoute des joueurs au store, d'id "p1", "p2"… dans l'ordre des noms donnés. */
export function seedPlayers(names: string[], patch: Partial<Player> = {}): Player[] {
	const players = names.map((name, i) => makePlayer(`p${i + 1}`, name, patch));
	usePlayersStore.setState({ players });
	return players;
}

export function makeGroup(id: string, name: string, playerIds: string[]): PlayerGroup {
	return { id, name, playerIds, isFavorite: false, isArchived: false, createdAt: 0 };
}

/** Partie terminée où chaque joueur n'a marqué que des points civils (`points[playerId]`). */
export function makeGame(
	id: string,
	points: Record<string, number>,
	options: {
		extensions?: ExtensionId[];
		createdAt?: number;
		patch?: (entry: PlayerGameEntry) => PlayerGameEntry;
	} = {},
): Game {
	const playerIds = Object.keys(points);
	const entries = Object.fromEntries(
		playerIds.map((playerId) => {
			const entry = {
				...createEmptyPlayerGameEntry(playerId),
				civilians: { points: points[playerId] },
			};
			return [playerId, options.patch ? options.patch(entry) : entry];
		}),
	);
	const createdAt = options.createdAt ?? Date.UTC(2026, 9, 11, 20);
	return {
		id,
		createdAt,
		finishedAt: createdAt + 3_600_000,
		extensions: options.extensions ?? [],
		playerIds,
		entries,
	};
}

/** Intercepte `Alert.alert` : les boutons d'une alerte se déclenchent ensuite via `pressAlertButton`. */
export function mockAlert() {
	return jest.spyOn(Alert, "alert").mockImplementation(() => {});
}

/** Presse le bouton `text` de la dernière alerte affichée (et attend son action si elle est async). */
export async function pressAlertButton(alertSpy: ReturnType<typeof mockAlert>, text: string) {
	const lastCall = alertSpy.mock.calls.at(-1);
	if (!lastCall) throw new Error("Aucune alerte affichée");
	const buttons = (lastCall[2] ?? []) as AlertButton[];
	const button = buttons.find((b) => b.text === text);
	if (!button) {
		throw new Error(`Bouton "${text}" absent de l'alerte "${lastCall[0]}"`);
	}
	await act(async () => {
		await button.onPress?.();
	});
}
