import { act, render, screen, userEvent, within } from "@testing-library/react-native";
import StatsScreen from "@/app/(tabs)/stats";
import { useHistoryStore } from "@/stores/historyStore";
import { makeGame, resetAllStores, seedPlayers } from "@/test-utils/fixtures";
import type { PlayerGameEntry } from "@/types/game";

const DAY = 24 * 3_600_000;

const withWonder =
	(wonders: Record<string, { name: string; side: "A" | "B" }>) => (entry: PlayerGameEntry) => ({
		...entry,
		wonder: wonders[entry.playerId],
	});

/**
 * Alice gagne 2 parties sur 3 (30-20 puis 40-10), Bob gagne la seule partie avec Cités (26-25).
 * Alice joue toujours Rhodes A, Bob Gizeh B.
 */
function seedHistory() {
	seedPlayers(["Alice", "Bob"]);
	const patch = withWonder({ p1: { name: "Rhodes", side: "A" }, p2: { name: "Gizeh", side: "B" } });
	const start = Date.UTC(2026, 8, 1);
	useHistoryStore.setState({
		games: [
			makeGame("g3", { p1: 40, p2: 10 }, { createdAt: start + 2 * DAY, patch }),
			makeGame("g2", { p1: 25, p2: 26 }, { createdAt: start + DAY, extensions: ["cities"], patch }),
			makeGame("g1", { p1: 30, p2: 20 }, { createdAt: start, patch }),
		],
	});
}

/** Contenu de la feuille de filtres, repérée par le titre de sa section joueurs. */
// Texte → ligne du `SectionTitle` → contenu de la feuille.
const playerPicker = (title = "Joueur") => within(screen.getByText(title).parent!.parent!);

/** Ferme la feuille comme le bouton retour d'Android (`onRequestClose` de la modale ouverte). */
const closeSheet = async () => {
	const [modal] = screen.container.queryAll(
		(node) => node.type === "Modal" && node.props.visible === true,
	);
	await act(() => modal.props.onRequestClose());
};

describe("Statistiques", () => {
	beforeEach(() => {
		resetAllStores();
	});

	it("invite à terminer une partie quand l'historique est vide", async () => {
		await render(<StatsScreen />);

		expect(screen.getByText(/Aucune statistique disponible/)).toBeOnTheScreen();
	});

	it("affiche les records et le taux de victoire de chaque joueur", async () => {
		seedHistory();
		await render(<StatsScreen />);

		expect(screen.getByText("40 pts")).toBeOnTheScreen();
		expect(screen.getByText("Meilleur score")).toBeOnTheScreen();
		expect(screen.getByText("1 pt(s)")).toBeOnTheScreen();
		expect(screen.getByText("2 victoire(s) sur 3 partie(s)")).toBeOnTheScreen();
		expect(screen.getByText("1 victoire(s) sur 3 partie(s)")).toBeOnTheScreen();
	});

	it("classe les merveilles par taux de victoire", async () => {
		seedHistory();
		await render(<StatsScreen />);

		expect(screen.getByText("Top 5 des meilleures merveilles")).toBeOnTheScreen();
		expect(screen.getAllByText("Rhodes (Face A)").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Gizeh (Face B)").length).toBeGreaterThan(0);
	});

	it("filtre les statistiques par extension, et signale un filtre sans résultat", async () => {
		const user = userEvent.setup();
		seedHistory();
		await render(<StatsScreen />);

		await user.press(screen.getByRole("button", { name: "Filtres" }));
		await user.press(screen.getByRole("checkbox", { name: "Cités" }));
		await closeSheet();

		expect(screen.getByRole("button", { name: "Filtres (1)" })).toBeOnTheScreen();
		expect(screen.getByText("1 victoire(s) sur 1 partie(s)")).toBeOnTheScreen();
		expect(screen.getByText("0 victoire(s) sur 1 partie(s)")).toBeOnTheScreen();

		await user.press(screen.getByRole("button", { name: "Filtres (1)" }));
		await user.press(screen.getByRole("checkbox", { name: "Armada" }));
		await closeSheet();

		expect(screen.getByText("Aucune partie ne correspond à ce filtre.")).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Réinitialiser les filtres" }));
		expect(screen.getByRole("button", { name: "Filtres" })).toBeOnTheScreen();
	});

	it("détaille les statistiques d'un joueur et le compare à un autre", async () => {
		const user = userEvent.setup();
		seedHistory();
		await render(<StatsScreen />);

		expect(screen.getByText(/Choisis un joueur/)).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Filtres" }));
		await user.press(playerPicker().getByText("Alice"));

		expect(screen.getByText("Parties jouées")).toBeOnTheScreen();
		expect(screen.getByText("Ses meilleures merveilles")).toBeOnTheScreen();

		await user.press(screen.getByRole("button", { name: "Comparer avec..." }));
		// Le joueur déjà affiché n'est pas proposé pour la comparaison.
		expect(playerPicker("Comparer avec").queryByText("Alice")).not.toBeOnTheScreen();
		await user.press(playerPicker("Comparer avec").getByText("Bob"));

		expect(screen.getAllByText("Parties jouées")).toHaveLength(2);
		await user.press(screen.getByRole("button", { name: "Retirer la comparaison" }));
		expect(screen.getAllByText("Parties jouées")).toHaveLength(1);
	});

	it("affiche en vue tableau la moyenne de points par catégorie", async () => {
		const user = userEvent.setup();
		seedHistory();
		await render(<StatsScreen />);

		await user.press(screen.getByRole("radio", { name: "Tableau" }));

		expect(screen.getByText("Moyenne de points par catégorie")).toBeOnTheScreen();
		// Totaux moyens : Alice (30 + 25 + 40) / 3 ≈ 32, Bob (20 + 26 + 10) / 3 ≈ 19.
		const totalRow = within(screen.getByText("Total").parent!.parent!);
		expect(totalRow.getByText("32")).toBeOnTheScreen();
		expect(totalRow.getByText("19")).toBeOnTheScreen();
		// Cités apparaît : une partie de l'historique utilise l'extension.
		expect(screen.getByText("Cités")).toBeOnTheScreen();

		// En vue tableau, les filtres ne proposent pas de choisir un joueur.
		await user.press(screen.getByRole("button", { name: "Filtres" }));
		expect(screen.queryByText("Joueur")).not.toBeOnTheScreen();
	});
});
