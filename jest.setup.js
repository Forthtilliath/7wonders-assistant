require("react-native-gesture-handler/jestSetup");

jest.mock("@react-native-async-storage/async-storage", () =>
	require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock(
	"react-native-safe-area-context",
	() => require("react-native-safe-area-context/jest/mock").default,
);

jest.mock("react-native-keyboard-controller", () =>
	require("react-native-keyboard-controller/jest"),
);

// Graphiques tiers remplacés par des vues vides : leur rendu n'est pas ce qu'on teste, et leurs
// animations différées (setTimeout) s'exécutent après la fin des tests.
jest.mock("react-native-gifted-charts", () => {
	const { View } = require("react-native");
	const chart = (name) => () => require("react").createElement(View, { testID: name });
	return { BarChart: chart("BarChart"), PieChart: chart("PieChart") };
});

// Les écrans sont rendus seuls, hors navigateur : la navigation est remplacée par un routeur espion
// (voir test-utils/expoRouter.tsx) et les options d'en-tête (titre, boutons) rendues dans l'écran.
jest.mock("expo-router", () => require("./test-utils/expoRouter"));
