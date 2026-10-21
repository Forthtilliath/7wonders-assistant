import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { UpdateChecker } from "@/components/settings/UpdateChecker";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { APP_INFO } from "@/constants/app";
import { CHANGELOG } from "@/constants/changelog";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/lib/date";

export default function ChangelogSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.updateHeader}>
					<Text style={styles.installedVersion}>Version installée : {APP_INFO.version}</Text>
					<UpdateChecker />
				</View>
				{CHANGELOG.map((entry) => (
					<View key={entry.version} style={styles.entry}>
						<View style={styles.header}>
							<Text style={styles.version}>Version {entry.version}</Text>
							<Text style={styles.date}>{formatDate(entry.date)}</Text>
						</View>
						{entry.items.map((item) => (
							<View key={item} style={styles.item}>
								<Text style={styles.bullet}>•</Text>
								<Text style={styles.itemText}>{item}</Text>
							</View>
						))}
					</View>
				))}
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
				updateHeader: {
					alignItems: "center",
					gap: SPACING.xs,
				},
				installedVersion: {
					color: colors.textMuted,
					fontSize: 13,
				},
				entry: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.xs,
				},
				header: {
					flexDirection: "row",
					alignItems: "baseline",
					justifyContent: "space-between",
				},
				version: {
					color: colors.text,
					fontSize: 15,
					fontWeight: "700",
				},
				date: {
					color: colors.textMuted,
					fontSize: 12,
				},
				item: {
					flexDirection: "row",
					gap: SPACING.xs,
				},
				bullet: {
					color: colors.primary,
					fontSize: 14,
				},
				itemText: {
					flex: 1,
					color: colors.text,
					fontSize: 13,
					lineHeight: 19,
				},
			}),
		[colors],
	);
}
