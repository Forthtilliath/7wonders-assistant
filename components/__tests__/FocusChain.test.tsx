import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Keyboard, TextInput } from "react-native";
import { compareReadingOrder, FocusChainProvider } from "@/components/ui/FocusChain";
import { NumberStepper } from "@/components/ui/NumberStepper";

// Méthodes natives du TextInput simulé par jest (partagées par toutes ses instances).
const native = TextInput.prototype as unknown as {
	measureInWindow: jest.Mock;
	focus: jest.Mock;
};

// Position verticale à l'écran de chaque champ, indépendante de l'ordre de rendu.
const ROWS: Record<string, number> = { Roues: 100, Compas: 200, Tablettes: 300 };

function Steppers({ labels }: { labels: string[] }) {
	return labels.map((label) => (
		<NumberStepper key={label} value={0} onChange={() => {}} label={label} />
	));
}

describe("FocusChain", () => {
	beforeEach(() => {
		native.focus.mockClear();
		native.measureInWindow.mockImplementation(function (
			this: { props: { accessibilityLabel: string } },
			callback: (x: number, y: number) => void,
		) {
			callback(0, ROWS[this.props.accessibilityLabel] ?? 0);
		});
	});

	afterEach(() => {
		native.measureInWindow.mockReset();
	});

	it("passe au champ situé juste en dessous, quel que soit l'ordre de rendu", async () => {
		await render(
			<FocusChainProvider>
				{/* Roues est rendu en dernier : l'ordre de montage n'aurait aucun champ après lui. */}
				<Steppers labels={["Compas", "Tablettes", "Roues"]} />
			</FocusChainProvider>,
		);
		const roues = screen.getByLabelText("Roues");
		expect(roues.props.returnKeyType).toBe("next");

		await act(() => fireEvent(roues, "submitEditing"));

		expect(native.focus).toHaveBeenCalledTimes(1);
		expect(native.focus.mock.contexts[0].props.accessibilityLabel).toBe("Compas");
	});

	it("ferme le clavier après le dernier champ", async () => {
		const dismiss = jest.spyOn(Keyboard, "dismiss");
		await render(
			<FocusChainProvider>
				<Steppers labels={["Roues", "Compas", "Tablettes"]} />
			</FocusChainProvider>,
		);

		await act(() => fireEvent(screen.getByLabelText("Tablettes"), "submitEditing"));

		expect(native.focus).not.toHaveBeenCalled();
		expect(dismiss).toHaveBeenCalled();
		dismiss.mockRestore();
	});

	it("appelle onComplete après le dernier champ, et seulement lui", async () => {
		const onComplete = jest.fn();
		await render(
			<FocusChainProvider onComplete={onComplete}>
				<Steppers labels={["Roues", "Compas", "Tablettes"]} />
			</FocusChainProvider>,
		);

		await act(() => fireEvent(screen.getByLabelText("Compas"), "submitEditing"));
		expect(onComplete).not.toHaveBeenCalled();

		await act(() => fireEvent(screen.getByLabelText("Tablettes"), "submitEditing"));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("donne le focus au premier champ à l'affichage avec autoFocusFirst", async () => {
		await render(
			<FocusChainProvider autoFocusFirst>
				<Steppers labels={["Compas", "Tablettes", "Roues"]} />
			</FocusChainProvider>,
		);
		await act(async () => {});

		expect(native.focus).toHaveBeenCalledTimes(1);
		expect(native.focus.mock.contexts[0].props.accessibilityLabel).toBe("Roues");
	});

	it("ne donne le focus à aucun champ par défaut", async () => {
		await render(
			<FocusChainProvider>
				<Steppers labels={["Roues"]} />
			</FocusChainProvider>,
		);
		await act(async () => {});

		expect(native.focus).not.toHaveBeenCalled();
	});

	it("laisse le comportement par défaut hors d'un groupe", async () => {
		await render(<Steppers labels={["Roues"]} />);

		expect(screen.getByLabelText("Roues").props.returnKeyType).toBeUndefined();
	});

	it("ordonne de haut en bas, puis de gauche à droite sur une même ligne", () => {
		const positions = [
			{ x: 50, y: 10 },
			{ x: 0, y: 40 },
			{ x: 0, y: 10.2 },
		];

		expect([...positions].sort(compareReadingOrder)).toEqual([
			{ x: 0, y: 10.2 },
			{ x: 50, y: 10 },
			{ x: 0, y: 40 },
		]);
	});
});
