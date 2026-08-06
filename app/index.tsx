import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { COLORS, SPACING } from "@/constants/theme";
import { useGameStore } from "@/stores/gameStore";

export default function HomeScreen() {
	const router = useRouter();
	const hasOngoingGame = useGameStore((s) => s.hasOngoingGame());

	return (
		<ScreenContainer style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>7 Wonders</Text>
				<Text style={styles.subtitle}>Assistant de score</Text>
			</View>

			<View style={styles.actions}>
				{hasOngoingGame ? (
					<Button
						label="Reprendre la partie en cours"
						onPress={() => router.push("/game/score/military")}
					/>
				) : (
					<Button label="Nouvelle partie" onPress={() => router.push("/game/new")} />
				)}
				<Link href="/players" asChild>
					<Button label="Joueurs" variant="secondary" />
				</Link>
				<Link href="/history" asChild>
					<Button label="Historique" variant="secondary" />
				</Link>
				<Link href="/stats" asChild>
					<Button label="Statistiques" variant="secondary" />
				</Link>
				<Link href="/settings" asChild>
					<Button label="Réglages" variant="ghost" />
				</Link>
			</View>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "space-between",
	},
	header: {
		marginTop: SPACING.xl,
		alignItems: "center",
		gap: SPACING.xs,
	},
	title: {
		color: COLORS.gold,
		fontSize: 36,
		fontWeight: "800",
	},
	subtitle: {
		color: COLORS.textMuted,
		fontSize: 16,
	},
	actions: {
		gap: SPACING.md,
		marginBottom: SPACING.xl,
	},
});
