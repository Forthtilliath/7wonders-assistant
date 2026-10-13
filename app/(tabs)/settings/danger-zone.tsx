import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useGroupsStore } from "@/stores/groupsStore";
import { useHistoryStore } from "@/stores/historyStore";
import { usePlayersStore } from "@/stores/playersStore";
import { useWondersStore } from "@/stores/wondersStore";

export default function DangerZoneSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();
	const clearPlayers = usePlayersStore((s) => s.replaceAll);
	const clearHistory = useHistoryStore((s) => s.replaceAll);
	const clearGroups = useGroupsStore((s) => s.replaceAll);
	const clearCustomWonders = useWondersStore((s) => s.replaceAll);

	const confirmClearData = () => {
		Alert.alert(
			"Effacer toutes les données ?",
			"Tous les joueurs, groupes et tout l'historique de parties seront supprimés définitivement.",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Tout effacer",
					style: "destructive",
					onPress: () => {
						clearPlayers([]);
						clearHistory([]);
						clearGroups([]);
						clearCustomWonders([]);
						router.back();
					},
				},
			],
		);
	};

	return (
		<ScreenContainer style={styles.container}>
			<Text style={styles.hint}>
				Supprime définitivement tous les joueurs, groupes, merveilles perso et l'historique de
				parties de cet appareil. Pense à exporter une sauvegarde avant si tu n'es pas sûr.
			</Text>
			<Button label="Effacer toutes les données" variant="danger" onPress={confirmClearData} />
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				container: {
					gap: SPACING.sm,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
					marginBottom: SPACING.xs,
				},
			}),
		[colors],
	);
}
