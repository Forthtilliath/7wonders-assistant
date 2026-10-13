module.exports = {
	preset: "jest-expo",
	// .claude/ peut contenir des worktrees d'agents (copies complètes du repo) : sans ce filtre,
	// leurs tests tournent en double et leurs modules entrent en collision avec ceux du projet.
	testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/", "/.claude/"],
	modulePathIgnorePatterns: ["<rootDir>/.claude/"],
	// Motif de jest-expo + les paquets @forthtilliath (et @noble / @scure, la crypto de backup-crypto), publiés
	// en ESM : à transformer comme le reste.
	transformIgnorePatterns: [
		"/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@forthtilliath|@noble|@scure))",
		"/node_modules/react-native-reanimated/plugin/",
		"/node_modules/@react-native/babel-preset/",
	],
	setupFiles: ["./jest.setup.js"],
	setupFilesAfterEnv: ["./jest.setup-after-env.js"],
	collectCoverageFrom: [
		"app/**/*.{ts,tsx}",
		"components/**/*.{ts,tsx}",
		"hooks/**/*.ts",
		"lib/**/*.ts",
		"stores/**/*.ts",
		"constants/**/*.ts",
		"!**/__tests__/**",
	],
};
