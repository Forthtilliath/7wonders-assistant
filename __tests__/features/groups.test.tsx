import { render, screen, userEvent } from "@testing-library/react-native";
import PlayersScreen from "@/app/(tabs)/players";
import EditGroupScreen from "@/app/groups/[id]";
import NewGroupScreen from "@/app/groups/new";
import { useGroupsStore } from "@/stores/groupsStore";
import { usePlayersStore } from "@/stores/playersStore";
import { mockRouter, setSearchParams } from "@/test-utils/expoRouter";
import {
	makeGroup,
	mockAlert,
	pressAlertButton,
	resetAllStores,
	seedPlayers,
} from "@/test-utils/fixtures";

const groups = () => useGroupsStore.getState().groups;

describe("Groupes de joueurs", () => {
	beforeEach(() => {
		resetAllStores();
	});

	it("crée un groupe avec un nom et au moins un membre", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob", "Chloé"]);
		await render(<NewGroupScreen />);

		const submit = screen.getByRole("button", { name: "Créer le groupe" });
		await user.type(screen.getByPlaceholderText("Ex : Soirée jeudi"), "Jeudi");
		expect(submit).toBeDisabled();

		await user.press(screen.getByRole("checkbox", { name: "Alice" }));
		await user.press(screen.getByRole("checkbox", { name: "Chloé" }));
		expect(screen.getByText("Membres (2/8)")).toBeOnTheScreen();
		await user.press(submit);

		expect(groups()).toHaveLength(1);
		expect(groups()[0]).toMatchObject({ name: "Jeudi", playerIds: ["p1", "p3"] });
		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("accepte jusqu'à 8 membres (extension Cités)", async () => {
		const user = userEvent.setup();
		const names = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"];
		seedPlayers(names);
		await render(<NewGroupScreen />);

		for (const name of names) {
			await user.press(screen.getByRole("checkbox", { name }));
		}

		expect(screen.getByText("Membres (8/8)")).toBeOnTheScreen();
		expect(screen.getByText(/qu'avec l'extension Cités/)).toBeOnTheScreen();
		expect(screen.getByRole("checkbox", { name: "A8" })).toBeChecked();
		expect(screen.getByRole("checkbox", { name: "A9" })).not.toBeChecked();
	});

	it("ne propose pas les joueurs archivés comme membres", async () => {
		seedPlayers(["Alice"]);
		usePlayersStore.getState().toggleArchived("p1");
		await render(<NewGroupScreen />);

		expect(screen.queryByRole("checkbox", { name: "Alice" })).not.toBeOnTheScreen();
		expect(screen.getByText(/Aucun joueur disponible/)).toBeOnTheScreen();
	});

	it("modifie le nom et les membres d'un groupe", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob"]);
		useGroupsStore.setState({ groups: [makeGroup("g1", "Jeudi", ["p1"])] });
		setSearchParams({ id: "g1" });
		await render(<EditGroupScreen />);

		expect(screen.getByRole("checkbox", { name: "Alice" })).toBeChecked();
		await user.clear(screen.getByDisplayValue("Jeudi"));
		await user.type(screen.getByPlaceholderText("Ex : Soirée jeudi"), "Vendredi");
		await user.press(screen.getByRole("checkbox", { name: "Bob" }));
		await user.press(screen.getByRole("button", { name: "Enregistrer" }));

		expect(groups()[0]).toMatchObject({ name: "Vendredi", playerIds: ["p1", "p2"] });
		expect(mockRouter.back).toHaveBeenCalled();
	});

	it("supprime un groupe après confirmation, sans toucher aux joueurs", async () => {
		const user = userEvent.setup();
		const alert = mockAlert();
		seedPlayers(["Alice"]);
		useGroupsStore.setState({ groups: [makeGroup("g1", "Jeudi", ["p1"])] });
		setSearchParams({ id: "g1" });
		await render(<EditGroupScreen />);

		await user.press(screen.getByRole("button", { name: "Supprimer le groupe" }));
		await pressAlertButton(alert, "Supprimer");

		expect(groups()).toEqual([]);
		expect(usePlayersStore.getState().players).toHaveLength(1);
	});

	it("signale un groupe introuvable", async () => {
		setSearchParams({ id: "inconnu" });
		await render(<EditGroupScreen />);

		expect(screen.getByText("Groupe introuvable.")).toBeOnTheScreen();
	});

	it("liste les groupes dans l'onglet Joueurs, avec favoris et archivage", async () => {
		const user = userEvent.setup();
		seedPlayers(["Alice", "Bob"]);
		useGroupsStore.setState({ groups: [makeGroup("g1", "Jeudi", ["p1", "p2"])] });
		await render(<PlayersScreen />);

		expect(screen.getByText("2 joueurs")).toBeOnTheScreen();
		await user.press(screen.getByRole("button", { name: "Modifier le groupe Jeudi" }));
		expect(mockRouter.push).toHaveBeenCalledWith("/groups/g1");

		// Les boutons du groupe précèdent ceux des joueurs dans la liste.
		await user.press(screen.getAllByRole("button", { name: "Ajouter aux favoris" })[0]);
		await user.press(screen.getAllByRole("button", { name: "Archiver" })[0]);
		expect(groups()[0]).toMatchObject({ isFavorite: true, isArchived: true });
	});
});
