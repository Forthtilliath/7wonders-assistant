import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";
import { getAvatarColor } from "@/lib/avatarColor";

type Props = {
	name: string;
	avatarUri?: string;
	size?: number;
	/** Identifiant stable pour dériver la couleur de fond (l'id du joueur, idéalement). Par défaut
	 * le nom, utilisé par exemple sur le formulaire de création où le joueur n'a pas encore d'id. */
	seed?: string;
};

export function PlayerAvatar({ name, avatarUri, size = 56, seed }: Props) {
	const initials = getInitials(name);
	const dimension = { width: size, height: size, borderRadius: size / 2 };

	if (avatarUri) {
		return (
			<Image source={{ uri: avatarUri }} style={[styles.image, dimension]} contentFit="cover" />
		);
	}

	const backgroundColor = getAvatarColor(seed || name);

	return (
		<View style={[styles.placeholder, dimension, { backgroundColor }]}>
			<Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
		</View>
	);
}

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

const styles = StyleSheet.create({
	image: {
		backgroundColor: COLORS.surfaceAlt,
	},
	placeholder: {
		backgroundColor: COLORS.surfaceAlt,
		alignItems: "center",
		justifyContent: "center",
	},
	initials: {
		color: COLORS.text,
		fontWeight: "700",
	},
});
