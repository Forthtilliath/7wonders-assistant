module.exports = {
	preset: "jest-expo",
	testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
	setupFiles: ["./jest.setup.js"],
};
