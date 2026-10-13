import { useMemo } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

const DONATION_URL = "https://buymeacoffee.com/forthtilliath";

export default function DonateSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	return (
		<ScreenContainer>
			<View style={styles.section}>
				<SectionTitle>Soutenir le projet</SectionTitle>
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
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				section: {
					...cardSurface(colors),
					borderRadius: RADIUS.md,
					padding: SPACING.md,
					gap: SPACING.sm,
				},
				sectionText: {
					color: colors.text,
					fontSize: 14,
					lineHeight: 20,
				},
				donateButton: {
					marginTop: SPACING.xs,
				},
			}),
		[colors],
	);
}
