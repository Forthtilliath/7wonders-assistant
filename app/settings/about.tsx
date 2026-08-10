import { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { APP_INFO } from "@/constants/app";
import { CHANGELOG } from "@/constants/changelog";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/date";

const DONATION_URL = "https://buymeacoffee.com/forthtilliath";

export default function AboutSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.appHeader}>
					<Text style={styles.appName}>{APP_INFO.name}</Text>
					<Text style={styles.appVersion}>Version {APP_INFO.version}</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Soutenir le projet</Text>
					<Text style={styles.sectionText}>
						L'app est gratuite, sans publicité et sans compte à créer. Si elle te rend service, un
						petit coup de pouce est toujours apprécié 🙂
					</Text>
					<Button
						label="Faire un don"
						onPress={() => Linking.openURL(DONATION_URL)}
						style={styles.donateButton}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Nouveautés</Text>
					{CHANGELOG.map((entry) => (
						<View key={entry.version} style={styles.changelogEntry}>
							<View style={styles.changelogHeader}>
								<Text style={styles.changelogVersion}>Version {entry.version}</Text>
								<Text style={styles.changelogDate}>{formatDate(entry.date)}</Text>
							</View>
							{entry.items.map((item) => (
								<View key={item} style={styles.changelogItem}>
									<Text style={styles.changelogBullet}>•</Text>
									<Text style={styles.changelogItemText}>{item}</Text>
								</View>
							))}
						</View>
					))}
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Infos</Text>
					<Text style={styles.sectionText}>
						Toutes les données (joueurs, parties, statistiques) restent stockées uniquement sur cet
						appareil : aucun compte, aucun serveur.
					</Text>
				</View>
			</ScrollView>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				content: {
					gap: SPACING.lg,
					paddingBottom: SPACING.lg,
				},
				appHeader: {
					alignItems: "center",
					gap: SPACING.xs,
				},
				appName: {
					color: colors.text,
					fontSize: 20,
					fontWeight: "800",
				},
				appVersion: {
					color: colors.textMuted,
					fontSize: 13,
				},
				section: {
					backgroundColor: colors.surface,
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				sectionTitle: {
					color: colors.textMuted,
					fontSize: 14,
					textTransform: "uppercase",
					letterSpacing: 0.5,
				},
				sectionText: {
					color: colors.text,
					fontSize: 14,
					lineHeight: 20,
				},
				donateButton: {
					marginTop: SPACING.xs,
				},
				changelogEntry: {
					gap: SPACING.xs,
				},
				changelogHeader: {
					flexDirection: "row",
					alignItems: "baseline",
					justifyContent: "space-between",
				},
				changelogVersion: {
					color: colors.text,
					fontSize: 15,
					fontWeight: "700",
				},
				changelogDate: {
					color: colors.textMuted,
					fontSize: 12,
				},
				changelogItem: {
					flexDirection: "row",
					gap: SPACING.xs,
				},
				changelogBullet: {
					color: colors.primary,
					fontSize: 14,
				},
				changelogItemText: {
					flex: 1,
					color: colors.text,
					fontSize: 13,
					lineHeight: 19,
				},
			}),
		[colors],
	);
}
