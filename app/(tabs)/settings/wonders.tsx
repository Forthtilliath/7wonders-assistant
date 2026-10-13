import { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { CustomWondersSection } from "@/components/wonders/CustomWondersSection";
import { WonderSourceSection } from "@/components/wonders/WonderSourceSection";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import {
	OFFICIAL_WONDERS,
	type OfficialWonderSource,
	WONDER_SOURCE_LABELS,
	WONDER_SOURCE_ORDER,
} from "@/constants/wonders";
import { useColors } from "@/hooks/useColors";

const OFFICIAL_SOURCES = WONDER_SOURCE_ORDER.filter(
	(source): source is OfficialWonderSource => source !== "custom",
);

const SOURCE_NOTES: Partial<Record<OfficialWonderSource, string>> = {
	leaders: "Proposée quand l'extension est active.",
	cities: "Proposées quand l'extension est active.",
	armada: "Proposée quand l'extension est active.",
	wonderPack: "Merveilles promo, proposées en 1re édition uniquement.",
};

export default function WondersSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<ScreenContainer padded={false}>
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				<Text style={styles.hint}>
					Ces merveilles sont proposées à la saisie du score, selon l'édition et les extensions de
					la partie. Le nom reste libre : tu peux toujours en taper un autre.
				</Text>
				{OFFICIAL_SOURCES.map((source) => (
					<WonderSourceSection
						key={source}
						title={WONDER_SOURCE_LABELS[source]}
						note={SOURCE_NOTES[source]}
						names={OFFICIAL_WONDERS.filter((w) => w.source === source).map((w) => w.name)}
					/>
				))}
				<CustomWondersSection />
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
					padding: SPACING.md,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 14,
				},
			}),
		[colors],
	);
}
