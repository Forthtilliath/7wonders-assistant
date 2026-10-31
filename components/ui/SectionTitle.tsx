import { SectionTitle as KitSectionTitle } from "@forthtilliath/react-native-kit/components/layout/SectionTitle";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { FONTS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type Props = {
	children: string;
	style?: StyleProp<ViewStyle>;
};

/** Titre de section façon inscription : losange doré, capitales Cinzel, puis filet jusqu'au bord. */
export function SectionTitle({ children, style }: Props) {
	const colors = useColors();

	return (
		<KitSectionTitle
			title={children}
			rule
			leading={
				<View
					style={{
						width: 6,
						height: 6,
						backgroundColor: colors.gold,
						transform: [{ rotate: "45deg" }],
					}}
				/>
			}
			styles={{
				container: [{ gap: SPACING.sm }, style],
				title: {
					color: colors.primary,
					fontFamily: FONTS.displayBold,
					fontWeight: "normal",
					fontSize: 13,
					letterSpacing: 1.2,
				},
				rule: { backgroundColor: colors.border },
			}}
		/>
	);
}
