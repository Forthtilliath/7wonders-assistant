import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CheckboxGroup } from "@/components/ui/CheckboxGroup";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { EXTENSION_LABELS, EXTENSION_ORDER } from "@/constants/categories";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
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
	return (
		<BottomSheet visible={visible} onClose={onClose} title="Filtres">
			<ScrollView contentContainerStyle={styles.content}>
				<Text style={styles.sectionTitle}>Extensions</Text>
				<CheckboxGroup<ExtensionId>
					options={EXTENSION_OPTIONS}
					values={extensionFilter}
					onChange={onChangeExtensionFilter}
				/>

				{players && (
					<>
						<Text style={styles.sectionTitle}>{playerSectionTitle}</Text>
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
									<PlayerAvatar name={player.name} avatarUri={player.avatarUri} size={36} />
									<Text style={styles.playerName} numberOfLines={1}>
										{player.name}
									</Text>
									{selected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
								</Pressable>
							);
						})}
					</>
				)}
			</ScrollView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: SPACING.sm,
		paddingBottom: SPACING.md,
	},
	sectionTitle: {
		color: COLORS.textMuted,
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
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
		backgroundColor: COLORS.surfaceAlt,
	},
	playerName: {
		flex: 1,
		color: COLORS.text,
		fontSize: 15,
	},
});
