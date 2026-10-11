import { render, screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { mockRouter } from "@/test-utils/expoRouter";

let shouldThrow = true;

function FragileScreen() {
	if (shouldThrow) throw new Error("rendu cassé");
	return <Text>Accueil</Text>;
}

describe("ErrorBoundary", () => {
	beforeEach(() => {
		shouldThrow = true;
		// Erreur volontaire : React et l'ErrorBoundary la journalisent en console.
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("affiche l'écran normalement en l'absence d'erreur", async () => {
		shouldThrow = false;
		await render(
			<ErrorBoundary>
				<FragileScreen />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Accueil")).toBeOnTheScreen();
	});

	it("remplace un écran qui plante par un écran de récupération", async () => {
		const user = userEvent.setup();
		await render(
			<ErrorBoundary>
				<FragileScreen />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Une erreur est survenue")).toBeOnTheScreen();
		expect(screen.getByText(/restent enregistrés/)).toBeOnTheScreen();

		shouldThrow = false;
		await user.press(screen.getByRole("button", { name: "Revenir à l'accueil" }));

		expect(mockRouter.replace).toHaveBeenCalledWith("/");
		expect(screen.getByText("Accueil")).toBeOnTheScreen();
	});
});
