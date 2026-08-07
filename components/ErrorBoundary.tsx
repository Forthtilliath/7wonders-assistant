import { router } from "expo-router";
import { Component, type ErrorInfo, type ReactNode, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Filet de sécurité pour une erreur de rendu imprévue (comme la boucle infinie rencontrée sur
 * l'écran Résultats pendant le développement) : sans ça, un bug non prévu en build de production
 * plante toute l'app plutôt que d'afficher un écran de récupération. Les données restent intactes
 * (persistées à part par les stores) : seul l'écran affiché est concerné.
 */
export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		// Pas de service de crash-reporting distant (app 100% locale) : juste une trace en console
		// pour ne pas perdre l'info si ça arrive en cours de développement.
		console.error("Erreur non interceptée :", error, info.componentStack);
	}

	handleReset = () => {
		this.setState({ error: null });
		router.replace("/");
	};

	render() {
		if (this.state.error) {
			return <ErrorFallback onReset={this.handleReset} />;
		}
		return this.props.children;
	}
}

// Composant fonctionnel séparé pour pouvoir utiliser le hook de thème : une classe React ne peut
// pas appeler de hooks directement dans sa propre méthode `render`.
function ErrorFallback({ onReset }: { onReset: () => void }) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>Une erreur est survenue</Text>
			<Text style={styles.message}>
				L'application a rencontré un problème inattendu. Tes joueurs et ton historique de parties
				restent enregistrés sur l'appareil.
			</Text>
			<Button label="Revenir à l'accueil" onPress={onReset} />
		</SafeAreaView>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					flex: 1,
					backgroundColor: colors.background,
					alignItems: "center",
					justifyContent: "center",
					padding: SPACING.lg,
					gap: SPACING.md,
				},
				title: {
					color: colors.text,
					fontSize: 20,
					fontWeight: "800",
				},
				message: {
					color: colors.textMuted,
					textAlign: "center",
				},
			}),
		[colors],
	);
}
