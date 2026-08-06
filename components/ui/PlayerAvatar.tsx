import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

type Props = {
	name: string;
	avatarUri?: string;
	size?: number;
};

export function PlayerAvatar({ name, avatarUri, size = 56 }: Props) {
	const initials = getInitials(name);
	const dimension = { width: size, height: size, borderRadius: size / 2 };

	if (avatarUri) {
		return (
			<Image source={{ uri: avatarUri }} style={[styles.image, dimension]} contentFit="cover" />
		);
	}

	return (
		<View style={[styles.placeholder, dimension]}>
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
