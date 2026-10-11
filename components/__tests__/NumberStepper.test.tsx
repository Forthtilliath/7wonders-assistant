import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { NumberStepper } from "@/components/ui/NumberStepper";

function Stepper({ initial = 0, min, max }: { initial?: number; min?: number; max?: number }) {
	const [value, setValue] = useState(initial);
	return <NumberStepper value={value} onChange={setValue} min={min} max={max} label="Pièces" />;
}

describe("NumberStepper", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("répète puis accélère tant que le bouton reste appuyé", async () => {
		await render(<Stepper />);
		const plus = screen.getByRole("button", { name: "Augmenter Pièces" });

		await fireEvent(plus, "pressIn");
		expect(screen.getByDisplayValue("1")).toBeOnTheScreen();

		// Répétition après 450 ms, puis toutes les 180 ms.
		await act(() => jest.advanceTimersByTime(450 + 180 * 2));
		expect(screen.getByDisplayValue("3")).toBeOnTheScreen();

		// Encore 4 pas lents jusqu'à l'accélération (1,2 s après le début de la répétition), puis
		// 5 pas rapides de 60 ms.
		await act(() => jest.advanceTimersByTime(1200 - 180 * 2 + 60 * 5));
		expect(screen.getByDisplayValue("12")).toBeOnTheScreen();

		// Relâché : plus aucun pas.
		await fireEvent(plus, "pressOut");
		await act(() => jest.advanceTimersByTime(1000));
		expect(screen.getByDisplayValue("12")).toBeOnTheScreen();
	});

	it("reste dans les bornes min et max", async () => {
		await render(<Stepper initial={9} min={0} max={10} />);

		await fireEvent(screen.getByRole("button", { name: "Augmenter Pièces" }), "pressIn");
		await act(() => jest.advanceTimersByTime(2000));
		await fireEvent(screen.getByRole("button", { name: "Augmenter Pièces" }), "pressOut");
		expect(screen.getByDisplayValue("10")).toBeOnTheScreen();

		await fireEvent.changeText(screen.getByLabelText("Pièces"), "-5");
		expect(screen.getByDisplayValue("5")).toBeOnTheScreen();
	});

	it("ignore la saisie intermédiaire d'un nombre négatif jusqu'à ce qu'il soit complet", async () => {
		await render(<Stepper initial={4} min={-30} />);
		const input = screen.getByLabelText("Pièces");

		await fireEvent.changeText(input, "-");
		expect(screen.getByDisplayValue("-")).toBeOnTheScreen();

		await fireEvent.changeText(input, "-13");
		await fireEvent(input, "blur");
		expect(screen.getByDisplayValue("-13")).toBeOnTheScreen();
	});
});
