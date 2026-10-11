module.exports = {
	preset: "jest-expo",
	// .claude/ peut contenir des worktrees d'agents (copies complètes du repo) : sans ce filtre,
	// leurs tests tournent en double et leurs modules entrent en collision avec ceux du projet.
	testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/", "/.claude/"],
	modulePathIgnorePatterns: ["<rootDir>/.claude/"],
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
