# Améliorations possibles

Pistes d'amélioration encore ouvertes. Rien n'est urgent sauf mention contraire — l'app fonctionne
bien en l'état.

## UI (interface)

_Rien en attente pour l'instant._

## UX (expérience utilisateur)

- **Partager le classement d'une partie** (texte simple ou image) via la feuille de partage
  système, directement depuis l'écran Résultats/Historique, sans passer par l'export CSV complet —
  pratique pour envoyer le résultat du soir sur un groupe de discussion.
- **Rappel de sauvegarde** : rappel périodique (ou indicateur discret) suggérant d'exporter une
  sauvegarde, puisque les données sont 100% locales sans synchronisation cloud — un changement de
  téléphone sans export préalable perd tout l'historique.

## Fonctionnalités

- **Multilingue** : tout est en français, en dur — à prévoir (extraction des textes + i18n).
- **Extensions Babel et Édifices** : hors périmètre pour l'instant, à ajouter si le besoin apparaît.

## Optimisation du code / maintenance

- **Stub `react-native-worklets`** dans `metro.config.js` (contournement d'un bug amont dans
  `@expo/ui`/`expo-router`) : si une vraie dépendance à `react-native-worklets` est ajoutée un jour
  (ex. `react-native-reanimated`), ce stub la cassera silencieusement. À retirer dès qu'une version
  corrigée d'`expo-router`/`@expo/ui` sort.
- **Export mort `EXTRA_CATEGORIES`** (`types/game.ts`) : jamais importé ailleurs, seul le type
  `ExtraCategoryId` qu'il sert à dériver est utilisé. À retirer ou à commenter.
- **Fichiers proches de la limite de 300 lignes** : `app/(tabs)/game/score/[category].tsx` (292),
  `app/(tabs)/stats.tsx` (266), `app/(tabs)/index.tsx` (259). À découper en sous-composants avant
  le prochain ajout.
- **`biome check .` analyse le dossier `android/`** (généré, ignoré par git) et échoue sur ses
  fichiers CMake : passer `vcs.useIgnoreFile` à `true` dans `biome.jsonc` pour qu'il respecte le
  `.gitignore`.

## Performance

_Rien d'identifié : les listes longues (Historique, Joueurs) utilisent déjà `FlatList` et les
statistiques sont mémoïsées._

## Sécurité / intégrité des données

_Rien d'identifié : les données (prénoms, scores, chemins d'images locales) ne sont pas sensibles,
le chiffrement de l'export ou d'AsyncStorage n'apporterait rien. Les imports sont validés (zod) et
précédés d'une sauvegarde de secours._
