import { selectFeedback } from "@forthtilliath/react-native-kit/utils/helpers/haptics";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BoxCoverOption } from "@/components/settings/BoxCoverOption";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { WonderPacksPicker } from "@/components/wonders/WonderPacksPicker";
import { EXTENSION_LABELS } from "@/constants/categories";
import { EDITION_COVERS, EXTENSION_COVERS } from "@/constants/covers";
import {
	EDITION_LABELS,
	GAME_EDITIONS,
	getAvailableExtensions,
	getExtensionsWarning,
} from "@/constants/editions";
import type { ThemeColors } from "@/constants/theme";
import { SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useWondersStore } from "@/stores/wondersStore";
import type { ExtensionId, GameEdition } from "@/types/game";

const EDITION_COVER_HEIGHT = 130;
const EXTENSION_COVER_HEIGHT = 110;
// Proportions des boîtes sans visuel : carrée pour un jeu de base, étroite pour une extension.
const EDITION_FALLBACK_RATIO = 0.88;
const EXTENSION_FALLBACK_RATIO = 0.55;

export default function NewGameSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const defaultEdition = usePreferencesStore((s) => s.defaultEdition);
	const defaultExtensions = usePreferencesStore((s) => s.defaultExtensions);
	const setDefaultEdition = usePreferencesStore((s) => s.setDefaultEdition);
	const setDefaultExtensions = usePreferencesStore((s) => s.setDefaultExtensions);
	const packs = useWondersStore((s) => s.packs);
	const setDefaultPackIds = useWondersStore((s) => s.setDefaultPackIds);
	const defaultPackIds = useMemo(
		() => packs.filter((p) => p.selectedByDefault).map((p) => p.id),
		[packs],
	);
	const warning = getExtensionsWarning(defaultExtensions);

	const chooseEdition = (edition: GameEdition) => {
		selectFeedback();
		setDefaultEdition(edition);
	};

	const toggleExtension = (ext: ExtensionId) => {
		selectFeedback();
		setDefaultExtensions(
			defaultExtensions.includes(ext)
				? defaultExtensions.filter((e) => e !== ext)
				: [...defaultExtensions, ext],
		);
	};

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.hint}>
					Cette édition et ces extensions sont pré-choisies automatiquement à la création d'une
					nouvelle partie. L'édition filtre les extensions proposées.
				</Text>
				<SectionTitle>Édition</SectionTitle>
				<View style={styles.covers}>
					{GAME_EDITIONS.map((edition) => (
						<BoxCoverOption
							key={edition}
							label={EDITION_LABELS[edition]}
							caption={EDITION_LABELS[edition]}
							cover={EDITION_COVERS[edition]}
							height={EDITION_COVER_HEIGHT}
							fallbackAspectRatio={EDITION_FALLBACK_RATIO}
							role="radio"
							selected={defaultEdition === edition}
							onPress={() => chooseEdition(edition)}
						/>
					))}
				</View>
				<SectionTitle>Extensions</SectionTitle>
				<View style={styles.covers}>
					{getAvailableExtensions(defaultEdition).map((ext) => (
						<BoxCoverOption
							key={ext}
							label={EXTENSION_LABELS[ext]}
							cover={EXTENSION_COVERS[ext]}
							height={EXTENSION_COVER_HEIGHT}
							fallbackAspectRatio={EXTENSION_FALLBACK_RATIO}
							role="checkbox"
							selected={defaultExtensions.includes(ext)}
							onPress={() => toggleExtension(ext)}
						/>
					))}
				</View>
				{warning && <Text style={styles.warning}>{warning}</Text>}
				<WonderPacksPicker
					values={defaultPackIds}
					onChange={setDefaultPackIds}
					style={styles.packs}
				/>
			</ScrollView>
		</ScreenContainer>
	);
}

function useStyles(colors: ThemeColors) {
	return useMemo(
		() =>
			StyleSheet.create({
				content: {
					gap: SPACING.sm,
					paddingBottom: SPACING.md,
				},
				hint: {
					color: colors.textMuted,
					fontSize: 13,
				},
				covers: {
					flexDirection: "row",
					flexWrap: "wrap",
					justifyContent: "center",
					gap: SPACING.sm,
				},
				warning: {
					color: colors.danger,
					fontSize: 13,
				},
				packs: {
					marginTop: SPACING.sm,
				},
			}),
		[colors],
	);
}
