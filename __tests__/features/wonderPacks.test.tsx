import { fireEvent, render, screen, userEvent } from "@testing-library/react-native";
import WonderPackScreen from "@/app/(tabs)/settings/wonder-packs/[id]";
import WondersSettingsScreen from "@/app/(tabs)/settings/wonders";
import { useWondersStore } from "@/stores/wondersStore";
import { mockRouter, resetRouterMock, setSearchParams } from "@/test-utils/expoRouter";
import { mockAlert, pressAlertButton, resetAllStores } from "@/test-utils/fixtures";

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
		expect(pack).toMatchObject({ name: "Wonders Box", enabled: true });
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
				packs: [{ id: "box", name: "Wonders Box", enabled: true, createdAt: 0 }],
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

		it("désactive l'extension, la renomme puis la supprime avec ses merveilles", async () => {
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
				screen.getByLabelText("Proposer ces merveilles à la saisie"),
				"valueChange",
				false,
			);
			expect(useWondersStore.getState().packs[0].enabled).toBe(false);

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
});
