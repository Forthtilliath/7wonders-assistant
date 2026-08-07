# Améliorations possibles

Liste de pistes recensées en construisant l'app (bugs réels identifiés, limites connues,
suggestions). Rien ici n'est urgent sauf mention contraire — l'app fonctionne bien en l'état.

## ✅ Corrigés

- **Import JSON applique désormais une vraie migration de schéma**, sur le même principe que la V1
  Capacitor (`convertDataVersion.ts`) mais réellement finie et branchée cette fois : le format est
  scindé en `lib/backupSchema.ts` (pur, testé) qui définit `DATA_VERSION`, une chaîne de migrations
  `MIGRATIONS[version] → version+1`, et rejette proprement un `dataVersion` trop récent (export
  fait depuis une version plus neuve de l'app) plutôt que de charger des données incompatibles en
  silence.
- **Error Boundary ajouté** (`components/ErrorBoundary.tsx`, branché dans `app/_layout.tsx`) : une
  erreur de rendu imprévue affiche désormais un écran de récupération ("Revenir à l'accueil") au
  lieu de planter toute l'app en build de production. Les données restent intactes (stores séparés).
- **Sauvegarde de secours avant import** : `importData()` écrit silencieusement une copie de l'état
  actuel avant d'écraser les données, restaurable depuis Réglages via "Annuler le dernier import"
  (`restoreSafetyBackup()`).
- **Couverture de tests étendue à toute la logique métier** : les fonctions `migrate` des 3 stores
  Zustand (`playersStore`, `historyStore`, `gameStore`) sont désormais extraites en fonctions pures
  exportées et testées isolément, ainsi que leurs actions (`addPlayer`, `startNewGame`,
  `finishGame`...) ; `lib/categoryFlow.ts`, `lib/scoring/total.ts`, `lib/scoring/game.ts` et
  `lib/stats.ts` ont chacun leur suite de tests. AsyncStorage est mocké via `jest.setup.js`
  (`jest.mock` + le mock officiel du package, référencé depuis `setupFiles`). 70 tests au total.
- **Validation de schéma à l'import (zod)** : après migration, chaque joueur et chaque partie d'une
  sauvegarde importée est validé en profondeur (`lib/backupSchema.ts`, `validateMigratedBackupData`)
  plutôt que de juste vérifier que `players`/`history` sont des tableaux. Un fichier corrompu ou
  modifié à la main est rejeté avec un message précis (champ + raison) au lieu de risquer de planter
  l'app au rendu.
- **Icône d'application sur mesure** : médaillon doré "7" sur fond navy (`assets/icon.png` +
  déclinaisons adaptive icon Android : foreground/background/monochrome), généré en SVG vectoriel
  (pas de police système, rendu identique partout) plutôt que les icônes par défaut d'Expo.
- **Mode clair ajouté**, réglable dans Réglages (`stores/themeStore.ts`, persisté). Toute l'app est
  passée d'un `COLORS` statique à un hook réactif `useColors()` (palettes `DARK_COLORS`/
  `LIGHT_COLORS` dans `constants/theme.ts`), chaque écran/composant recalculant ses styles via
  `useMemo` quand le thème change.
- **Icônes thématiques par catégorie** (`CATEGORY_META.icon`, MaterialCommunityIcons : épée pour
  militaire, pièces pour trésor, château pour merveille, etc.) remplaçant les simples points de
  couleur dans le tableau croisé, les graphiques et les cartes de résultats.
- **Couleur d'avatar distincte par joueur** sans photo (`lib/avatarColor.ts`, dérivée
  déterministiquement de l'id du joueur) au lieu d'une couleur de fond unique pour tous.
- **`NumberStepper`** accélère désormais en appui long sur +/- (délai puis répétition, qui
  s'accélère encore après ~1,2 s) pour saisir vite les grandes valeurs.
- **Swipe + animation de transition** sur l'écran de saisie de score : swipe gauche/droite pour
  naviguer entre catégories (`router.back()`/`goNext()`), avec une transition `slide_from_right`
  explicite sur ces écrans pour rendre la navigation tactile plus perceptible.
- **Export CSV de l'historique** (`lib/csv.ts`, une ligne par joueur par partie, séparateur `;` +
  BOM UTF-8 pour Excel FR) en plus du JSON, accessible depuis Réglages.
- **Action "Rejouer avec les mêmes joueurs"** sur l'écran de détail d'une partie : relance une
  partie avec les mêmes joueurs et extensions (en avertissant, ou en bloquant si trop peu restent,
  si certains joueurs ont depuis été supprimés).
- **Attributs d'accessibilité** (`accessibilityRole`/`accessibilityLabel`/`accessibilityState`) sur
  tous les boutons, chips, cases à cocher et boutons radio personnalisés (`Button`, `CheckboxGroup`,
  `RadioGroup`, `NumberStepper`, `SelectablePlayerCard`, `PlayerListItem`/`GroupListItem`, chips
  d'extensions/groupes, `BottomSheet`, `TextField`) — utilisable avec un lecteur d'écran (TalkBack).
- **Mode "jetons"** pour Militaire et Maritime (`components/game/TokenCounterSheet.tsx`) : un
  bouton "Compter par jetons" ouvre un sheet avec un compteur par valeur de jeton (Victoire
  +1/+3/+5, Défaite -1 pour le militaire ; +1/+3/+5/+7 et -1/-2/-3 pour le maritime, valeurs
  vérifiées dans les règles officielles de l'extension Armada), qui somme automatiquement dans le
  champ existant — en plus de la saisie directe du total, pas à sa place.
- **Extension Armada scindée en deux catégories de score** : les jetons maritimes (conflit naval)
  et les cartes Îles + plateau individuel Armada sont désormais deux entrées séparées (`armada` et
  `islands`), chacune avec son propre écran de saisie, plutôt qu'un seul total agrégé qui mélangeait
  des sources de points très différentes.
- **Avertissement de nom de joueur en double** (`lib/players.ts`, `hasDuplicateName`) : à la
  création ou au renommage d'un joueur, si un autre joueur porte déjà ce nom, un message suggère de
  renommer l'un des deux ou d'ajouter une photo pour les distinguer — sans bloquer la création (deux
  personnes peuvent légitimement porter le même prénom).

## UX (expérience utilisateur)

- Lancer une nouvelle partie alors qu'une partie est déjà en cours l'écrase silencieusement (pas
  de confirmation "une partie est en cours, l'abandonner ?").
- Pas de recherche/tri dans la liste des joueurs ou l'historique — deviendra utile avec beaucoup
  de joueurs/parties.
- Pas d'état d'accueil guidé pour un utilisateur qui n'a encore aucun joueur/partie (expliquer le
  flow : créer des joueurs → nouvelle partie → jouer).
- Abandonner une partie en cours n'est possible que depuis l'écran Résultats ; si on quitte l'app
  au milieu de la saisie sans aller jusqu'au bout, la partie reste "en cours" indéfiniment (juste
  récupérable via "Reprendre", ce qui est correct, mais pas évident si on a oublié).
- Pas de retour haptique sur les boutons/steppers (confort tactile mobile).
- Pas de suggestion/autocomplétion du nom de merveille à partir des noms déjà saisis (réduirait les
  doublons dus à des fautes de frappe dans les statistiques par merveille).
- Changer le filtre d'extensions dans Statistiques ne réinitialise pas le joueur sélectionné même
  s'il n'a plus de partie correspondante (affiche juste "aucune partie" au lieu de reproposer un choix).

## Sécurité / intégrité des données

- ~~Export JSON non chiffré~~ / ~~données en clair dans AsyncStorage~~ : écartés délibérément — les
  données de l'app (prénoms, scores, liens d'images locales) ne sont pas sensibles, chiffrer
  n'apporterait rien. À reconsidérer seulement si l'app venait à stocker un jour un autre type de
  donnée.

## Optimisation du code

- L'I/O fichier de `lib/backup.ts` (lecture/écriture via `expo-file-system`, `restoreSafetyBackup`,
  `exportGamesCsv`) n'est pas testée — nécessiterait de mocker `expo-file-system`/`expo-sharing`.
  Seule sa logique pure (extraite dans `lib/backupSchema.ts` et `lib/csv.ts`) l'est.
- `expo-document-picker` reste installé dans `package.json` sans être utilisé nulle part (remplacé
  par `File.pickFileAsync` d'`expo-file-system`) — jamais retiré à cause d'un conflit de peer
  dependencies npm rencontré à l'époque.
- Le stub de `react-native-worklets` dans `metro.config.js` (contournement d'un bug amont dans
  `@expo/ui`/`expo-router`) est une dette technique à surveiller : si une vraie dépendance à
  `react-native-worklets` est ajoutée un jour (ex. `react-native-reanimated`), ce stub la cassera
  silencieusement. À retirer dès qu'une version corrigée d'`expo-router`/`@expo/ui` sort.
- Plusieurs écrans recalculent des statistiques dérivées (classement, moyennes) indépendamment via
  `useMemo` séparés plutôt qu'une seule passe partagée — sans impact perceptible à l'échelle d'un
  historique de parties personnel, mais à surveiller si l'historique grossit beaucoup.
- Quelques `as` de type dans `lib/stats.ts` (accès dynamique aux catégories d'un score) qui
  contournent la vérification stricte des types ; un typage plus précis de `PlayerScoreBreakdown`
  éviterait ces casts.
- Version affichée dans Réglages (`constants/app.ts`) codée en dur, non synchronisée avec
  `package.json`.

## Fonctionnalités

- Pas de support multilingue (tout est en français, en dur) — prévu pour plus tard, pas encore
  planifié précisément.
- Pas de fusion de joueurs en doublon (même personne créée deux fois par erreur) — décision
  assumée : deux joueurs peuvent légitimement porter le même nom, donc pas de fusion automatique ;
  seul un avertissement à la création/au renommage est affiché (voir "✅ Corrigés").
- Extensions Babel et Édifices toujours hors périmètre (décision assumée au départ, listée ici pour
  mémoire si le besoin change).
