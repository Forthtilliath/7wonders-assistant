import { NativeModules, type TurboModule, TurboModuleRegistry } from "react-native";

/**
 * Le module natif `name` est-il présent dans ce binaire ? Sert à charger à la demande une lib qui
 * exige son module natif dès l'import : sur un binaire compilé sans elle (ancienne build de dev),
 * l'importer quand même ferait planter l'app au lieu de désactiver la seule fonctionnalité concernée.
 */
export function isNativeModuleAvailable(name: string): boolean {
	return TurboModuleRegistry.get<TurboModule>(name) != null || NativeModules[name] != null;
}
