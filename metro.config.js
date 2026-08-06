// Learn more https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
