import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { APP_INFO, RELEASES_REPO } from "@/constants/app";
import { EXTENSION_LABELS } from "@/constants/categories";
import type { ThemeColors } from "@/constants/theme";
import { cardSurface, FONTS, RADIUS, SPACING } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { ALL_EXTENSIONS } from "@/types/game";

const REPO_URL = `https://github.com/${RELEASES_REPO.owner}/${RELEASES_REPO.repo}`;
const ISSUES_URL = `${REPO_URL}/issues`;
const EXTENSIONS_LIST = ALL_EXTENSIONS.map((ext) => EXTENSION_LABELS[ext]).join(", ");

/** À propos : ce que fait l'app, où vont les données, d'où viennent les mises à jour et les crédits.
 * La vérification des mises à jour et les versions de test vivent dans Nouveautés, pas ici. */
export default function AboutSettingsScreen() {
	const colors = useColors();
	const styles = useStyles(colors);
	const router = useRouter();

	const section = (title: string, children: ReactNode) => (
		<View style={styles.section}>
			<SectionTitle>{title}</SectionTitle>
			{children}
		</View>
	);

	return (
		<ScreenContainer>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.appHeader}>
					<Text style={styles.appName}>{APP_INFO.name}</Text>
					<Text style={styles.appVersion}>Version {APP_INFO.version} · Android</Text>
					<Text style={styles.tagline}>
						Compte les points de 7 Wonders à ta place, catégorie par catégorie, et garde
						l'historique et les statistiques de tes parties.
					</Text>
					<Button
						label="Nouveautés et mises à jour"
						variant="ghost"
						onPress={() => router.push("/settings/changelog")}
					/>
				</View>

				{section(
					"Jeux pris en charge",
					<Text style={styles.sectionText}>
						Jeu de base en 1re et 2e édition, extensions {EXTENSIONS_LIST}, et merveilles du Wonder
						Pack. Tu peux aussi ajouter tes propres merveilles et extensions non officielles depuis
						Réglages › Merveilles.
					</Text>,
				)}

				{section(
					"Tes données",
					<>
						<Text style={styles.sectionText}>
							Toutes les données (joueurs, parties, statistiques) sont stockées sur cet appareil,
							sans compte à créer ni publicité. Seule la sauvegarde Google Drive, si tu l'actives,
							en envoie une copie dans un dossier privé de ton Drive, invisible pour les autres
							applications.
						</Text>
						<Text style={styles.sectionText}>
							Elles ne partent pas dans la sauvegarde automatique d'Android : avant de changer de
							téléphone, exporte une sauvegarde ou active Google Drive (Réglages › Gestion des
							sauvegardes).
						</Text>
					</>,
				)}

				{section(
					"Mises à jour",
					<Text style={styles.sectionText}>
						Les nouvelles versions ne viennent que des publications du dépôt GitHub de l'app. Chaque
						fichier téléchargé est contrôlé (empreinte SHA-256) avant installation, et Android
						refuse toute version qui ne serait pas signée avec la même clé que l'app installée.
					</Text>,
				)}

				{section(
					"Code source",
					<>
						<Text style={styles.sectionText}>
							L'app est libre et gratuite (licence MIT). Une idée, un bug, un score mal calculé ?
							Signale-le sur GitHub.
						</Text>
						<Button
							label="Signaler un problème"
							variant="secondary"
							onPress={() => Linking.openURL(ISSUES_URL)}
						/>
						<Button
							label="Voir le code source"
							variant="ghost"
							onPress={() => Linking.openURL(REPO_URL)}
						/>
					</>,
				)}

				{section(
					"Crédits",
					<Text style={styles.sectionText}>
						7 Wonders est un jeu d'Antoine Bauza, édité par Repos Production. Cette application non
						officielle, faite par un joueur, n'est ni affiliée à Repos Production ni approuvée par
						l'éditeur. Noms du jeu et visuels des boîtes © Repos Production.
					</Text>,
				)}
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
					fontFamily: FONTS.displayBold,
				},
				appVersion: {
					color: colors.textMuted,
					fontSize: 13,
				},
				tagline: {
					color: colors.text,
					fontSize: 14,
					lineHeight: 20,
					textAlign: "center",
					marginTop: SPACING.xs,
				},
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
			}),
		[colors],
	);
}
