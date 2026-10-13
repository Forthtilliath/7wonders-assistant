import { fireEvent, render, screen, userEvent, within } from "@testing-library/react-native";
import CategoryScoreScreen from "@/app/(tabs)/game/score/[category]";
import WonderPackScreen from "@/app/(tabs)/settings/wonder-packs/[id]";
import WondersSettingsScreen from "@/app/(tabs)/settings/wonders";
import { useGameStore } from "@/stores/gameStore";
import { useWondersStore } from "@/stores/wondersStore";
import { mockRouter, resetRouterMock, setSearchParams } from "@/test-utils/expoRouter";
import { mockAlert, pressAlertButton, resetAllStores, seedPlayers } from "@/test-utils/fixtures";

const wonderNames = () => useWondersStore.getState().customWonders.map((w) => w.name);

describe("Extensions non officielles", () => {
	beforeEach(() => {
		resetAllStores();
		resetRouterMock();
	});

	it("crée une extension, refuse un doublon et ouvre sa page", async () => {
		const user = userEvent.setup();
		await render(<WondersSettingsScreen />);
		const field = screen.getByPlaceholderText("Nouvelle extension");

		await user.type(field, "Wonders Box");
		await user.press(screen.getByRole("button", { name: "Créer l'extension" }));
		const [pack] = useWondersStore.getState().packs;
		expect(pack).toMatchObject({ name: "Wonders Box", selectedByDefault: false });
		expect(mockRouter.push).toHaveBeenCalledWith(`/settings/wonder-packs/${pack.id}`);
		expect(screen.getByRole("button", { name: "Wonders Box, 0 merveille" })).toBeOnTheScreen();

		await user.type(field, "wonders box");
		await user.press(screen.getByRole("button", { name: "Créer l'extension" }));
		expect(screen.getByText("Cette extension existe déjà.")).toBeOnTheScreen();
		expect(useWondersStore.getState().packs).toHaveLength(1);
	});

	describe("page d'une extension", () => {
		beforeEach(() => {
			useWondersStore.setState({
				packs: [{ id: "box", name: "Wonders Box", selectedByDefault: true, createdAt: 0 }],
			});
			setSearchParams({ id: "box" });
		});

		it("ajoute une liste collée et garde dans le champ les noms écartés", async () => {
			const user = userEvent.setup();
			await render(<WonderPackScreen />);
			const field = screen.getByPlaceholderText("Nouvelles merveilles, une par ligne");

			await fireEvent.changeText(field, "Atlantide\n\n  Ys \nRhodes\natlantide");
			await user.press(screen.getByRole("button", { name: "Ajouter" }));

			expect(wonderNames()).toEqual(["Atlantide", "Ys"]);
			expect(useWondersStore.getState().customWonders.every((w) => w.packId === "box")).toBe(true);
			expect(screen.getByText(/2 ajoutée\(s\)\. Non ajoutée\(s\)/)).toBeOnTheScreen();
			expect(field.props.value).toBe("Rhodes\natlantide");
			expect(screen.getByText("Ys")).toBeOnTheScreen();
		});

		it("la décoche par défaut, la renomme puis la supprime avec ses merveilles", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			useWondersStore.setState({
				customWonders: [
					{ id: "w1", name: "Atlantide", packId: "box", createdAt: 0 },
					{ id: "w2", name: "Ys", createdAt: 0 },
				],
			});
			await render(<WonderPackScreen />);

			await fireEvent(
				screen.getByLabelText("Cochée par défaut pour une nouvelle partie"),
				"valueChange",
				false,
			);
			expect(useWondersStore.getState().packs[0].selectedByDefault).toBe(false);

			const nameField = screen.getByDisplayValue("Wonders Box");
			await fireEvent.changeText(nameField, "Ma Box");
			await fireEvent(nameField, "endEditing");
			expect(useWondersStore.getState().packs[0].name).toBe("Ma Box");

			await user.press(screen.getByRole("button", { name: "Supprimer l'extension" }));
			await pressAlertButton(alert, "Supprimer");
			expect(useWondersStore.getState().packs).toEqual([]);
			// Les merveilles hors de l'extension restent.
			expect(wonderNames()).toEqual(["Ys"]);
			expect(mockRouter.back).toHaveBeenCalled();
		});
	});
	describe("saisie du score", () => {
		beforeEach(() => {
			seedPlayers(["Alice", "Bob"]);
			useWondersStore.setState({
				packs: [
					{ id: "box", name: "Wonders Box", selectedByDefault: false, createdAt: 0 },
					{ id: "mine", name: "Mes créations", selectedByDefault: false, createdAt: 0 },
				],
				customWonders: [
					{ id: "w1", name: "Atlantide", packId: "box", createdAt: 0 },
					{ id: "w2", name: "Ys", packId: "mine", createdAt: 0 },
				],
			});
			setSearchParams({ category: "wonders" });
		});

		it("ne propose que les merveilles des extensions cochées pour la partie", async () => {
			useGameStore.getState().startNewGame(["p1", "p2"], [], "first", ["box"]);
			await render(<CategoryScoreScreen />);

			expect(screen.getAllByRole("button", { name: "Utiliser le nom Atlantide" })).toHaveLength(2);
			expect(screen.queryByRole("button", { name: "Utiliser le nom Ys" })).toBeNull();
		});

		it("coche une extension oubliée en cours de partie, sans confirmation", async () => {
			const user = userEvent.setup();
			const alert = mockAlert();
			useGameStore.getState().startNewGame(["p1", "p2"], []);
			await render(<CategoryScoreScreen />);
			expect(screen.queryByRole("button", { name: "Utiliser le nom Ys" })).toBeNull();

			await user.press(
				screen.getByRole("button", { name: "Modifier les extensions de la partie" }),
			);
			const sheet = within(screen.getByText("Extensions de la partie").parent!);
			await user.press(sheet.getByRole("checkbox", { name: "Mes créations" }));
			await user.press(sheet.getByRole("button", { name: "Valider" }));

			expect(alert.mock.calls.map(([title]) => title)).not.toContain("Modifier les extensions ?");
			expect(useGameStore.getState().wonderPacks).toEqual(["mine"]);
			expect(screen.getAllByRole("button", { name: "Utiliser le nom Ys" })).toHaveLength(2);
		});
	});
});
