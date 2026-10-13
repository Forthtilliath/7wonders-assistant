import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import type { ExtensionFilter } from "@/lib/gameFilters";
import type { ExtensionId, Player } from "@/types/game";

type Props = {
	visible: boolean;
	onClose: () => void;
	extensionFilter: ExtensionFilter;
	onChangeExtensionFilter: (filter: ExtensionFilter) => void;
	/** Si fourni, affiche aussi une liste de joueurs à choisir (un seul, sélection simple). */
	players?: Player[];
	selectedPlayerId?: string;
	onSelectPlayer?: (id: string) => void;
	playerSectionTitle?: string;
};

const EXTENSION_OPTIONS = EXTENSION_ORDER.map((ext) => ({
	value: ext,
	label: EXTENSION_LABELS[ext],
}));

export function FiltersSheet({
	visible,
	onClose,
	extensionFilter,
	onChangeExtensionFilter,
	players,
	selectedPlayerId,
	onSelectPlayer,
	playerSectionTitle = "Joueur",
}: Props) {
	const colors = useColors();
	const styles = useStyles(colors);

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Filtres">
			<View style={styles.content}>
				<SectionTitle style={styles.sectionTitle}>Extensions</SectionTitle>
				<CheckboxGroup<ExtensionId>
					options={EXTENSION_OPTIONS}
					values={extensionFilter}
					onChange={onChangeExtensionFilter}
				/>

				{players && (
					<>
						<SectionTitle style={styles.sectionTitle}>{playerSectionTitle}</SectionTitle>
						{players.map((player) => {
							const selected = player.id === selectedPlayerId;
							return (
								<Pressable
									key={player.id}
									style={[styles.playerRow, selected && styles.playerRowSelected]}
									onPress={() => {
										onSelectPlayer?.(player.id);
										onClose();
									}}
								>
									<PlayerAvatar
										name={player.name}
										avatarUri={player.avatarUri}
										seed={player.id}
										size={36}
									/>
									<Text style={styles.playerName} numberOfLines={1}>
										{player.name}
									</Text>
									{selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
								</Pressable>
							);
						})}
					</>
				)}
			</View>
		</BottomSheet>
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
				sectionTitle: {
					marginTop: SPACING.sm,
				},
				playerRow: {
					flexDirection: "row",
					alignItems: "center",
					gap: SPACING.sm,
					padding: SPACING.sm,
					borderRadius: RADIUS.md,
				},
				playerRowSelected: {
					backgroundColor: colors.surfaceAlt,
				},
				playerName: {
					flex: 1,
					color: colors.text,
					fontSize: 15,
				},
			}),
		[colors],
	);
}
