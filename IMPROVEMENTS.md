# Améliorations possibles

Pistes d'amélioration encore ouvertes. Rien n'est urgent sauf mention contraire — l'app fonctionne
bien en l'état.

## UI (interface)

_Rien en attente pour l'instant._

## UX (expérience utilisateur)

- **Photos des joueurs non sauvegardées** : `avatarUri` pointe vers le cache de l'appareil
  (fichier choisi via le sélecteur d'images), seul le chemin part dans la sauvegarde JSON / Google
  Drive. Après restauration sur un autre téléphone, les avatars retombent sur l'initiale colorée.
  Pour les garder : copier l'image dans `Paths.document` à la création du joueur, puis l'embarquer
  (base64 redimensionné) dans la sauvegarde.

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
  `app/(tabs)/index.tsx` (280), `app/(tabs)/stats.tsx` (266). À découper en sous-composants avant
  le prochain ajout.
- **`biome check .` analyse le dossier `android/`** (généré, ignoré par git) et échoue sur ses
  fichiers CMake : passer `vcs.useIgnoreFile` à `true` dans `biome.jsonc` pour qu'il respecte le
  `.gitignore`.

## Performance

_Rien d'identifié : les listes longues (Historique, Joueurs) utilisent déjà `FlatList` et les
statistiques sont mémoïsées._

- **Conflit de peer dependencies** préexistant (`react-dom@19.2.8` tiré par `expo-router` exige
  `react@^19.2.8`, l'app est en `19.2.3`) : `npm install <paquet>` échoue en ERESOLVE. Utiliser
  `--force` (garde les peers installés) et surtout pas `--legacy-peer-deps`, qui élague
  `react-native-reanimated`/`worklets` du lockfile. Se règle à la prochaine montée d'Expo SDK.

## Sécurité / intégrité des données

- **Clé de debug encore déclarée dans le client OAuth Google** : le release est désormais signé avec
  une clé propre au projet (plugin `withReleaseSigning` de `@forthtilliath/expo-config-plugins`, voir README). Une fois la SHA-1 de
  release ajoutée, retirer la SHA-1 de debug (`5E:8F:16:06:…:F6:25`, publique) du client OAuth de
  production, ou la déplacer dans un projet Google Cloud de test.

Pour le reste, rien d'identifié : les données (prénoms, scores, chemins d'images locales) ne sont
pas sensibles, le chiffrement de l'export ou d'AsyncStorage n'apporterait rien. Les imports (fichier
ou Google Drive) sont validés (zod) et précédés d'une sauvegarde de secours.
