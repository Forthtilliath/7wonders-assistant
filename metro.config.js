// Learn more https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-router bundles an optional integration with `react-native-worklets` (via @expo/ui, for an
// experimental Android Stack toolbar menu we don't use). The installed react-native-worklets
// version has a broken internal import that fails Metro's bundling even though the dependency is
// only ever `require()`-d inside a try/catch and never actually used by this app. Stub it out so
// Metro doesn't try to bundle its (buggy) internals.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (moduleName === "react-native-worklets") {
		return { type: "empty" };
	}
	if (originalResolveRequest) {
		return originalResolveRequest(context, moduleName, platform);
	}
	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
