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
- **L'I/O de `lib/backup.ts` est désormais testée** (`lib/__tests__/backup.io.test.ts`) :
  `expo-file-system`/`expo-sharing` sont mockés (système de fichiers en mémoire dans la closure de
  la factory `jest.mock`, sans variable externe pour respecter la contrainte de hoisting de Jest),
  couvrant `exportData`, `exportGamesCsv`, `importData` (annulation, JSON invalide, version trop
  récente, sauvegarde de secours) et `restoreSafetyBackup`.
- **`expo-document-picker` retiré** de `package.json` : plus aucun usage depuis le passage à
  `File.pickFileAsync` d'`expo-file-system`.
- **Casts `as` non vérifiés remplacés** par `getCategoryScore()` (`lib/scoring/total.ts`), un accès
  `switch` exhaustif sur `CategoryId` : oublier une catégorie devient une erreur de compilation
  plutôt qu'un bug silencieux à l'exécution. Utilisé dans `lib/stats.ts` et `RankedPlayerCard.tsx`.
- **Version affichée dans Réglages synchronisée** avec `package.json` (`constants/app.ts` importe
  directement `version` au lieu de la dupliquer en dur).
- **Calcul de stats évité en vue graphique** (`app/(tabs)/stats.tsx`) : `statsByPlayerId`, utilisé
  uniquement par `ScoreTable` en vue tableau, ne se calcule plus du tout quand la vue graphique est
  affichée.
- **Confirmation avant d'écraser une partie en cours** : lancer une nouvelle partie (bouton ou
  swipe) alors qu'une partie est déjà en cours demande confirmation avant de l'abandonner. Un
  bouton "Abandonner la partie en cours" est aussi ajouté directement sur l'onglet Nouvelle partie,
  à côté de "Reprendre", pour ne plus avoir à passer par l'écran Résultats.
- **État d'accueil guidé** sur l'onglet Nouvelle partie quand aucun joueur n'existe encore : message
  de bienvenue + bouton "Créer mon premier joueur" plutôt qu'une grille vide.
- **Recherche** ajoutée sur les listes Joueurs (par nom) et Historique (par joueur ayant participé).
- **Retour haptique** (`expo-haptics`, `lib/haptics.ts`) sur les boutons, les pas de `NumberStepper`,
  et les sélections (cases à cocher, boutons radio, cartes joueur, chips) — retiré temporairement
  quand un pas de stepper est bloqué par sa borne min/max pour ne pas vibrer dans le vide.
- **Suggestions de noms de merveille** (`lib/wonders.ts`, `WonderNameField`) : en tapant le nom
  d'une merveille, les noms déjà utilisés dans l'historique qui correspondent s'affichent en
  suggestions cliquables, pour réduire les doublons dus à des fautes de frappe dans les
  statistiques par merveille.
- **Sélection réinitialisée dans Statistiques** quand le filtre d'extensions exclut le joueur (ou le
  joueur de comparaison) actuellement affiché, plutôt que de laisser une sélection obsolète ; un
  bouton "Réinitialiser les filtres" apparaît aussi quand plus aucune partie ne correspond.
- **Couleur d'avatar cohérente partout** : l'écran "Modifier le joueur" dérivait la couleur à partir
  du nom (faute d'id transmis à `PlayerForm`) alors que toutes les listes/cartes la dérivent de
  l'id — un même joueur pouvait donc changer de couleur selon l'écran. `PlayerForm` accepte
  maintenant un `playerId` optionnel (absent seulement à la création, où l'id n'existe pas encore).
  Palette aussi élargie de 10 à 18 teintes pour réduire les couleurs identiques entre joueurs.
- **Indicateur de favori sur la grille de sélection** (`SelectablePlayerCard`) : un badge étoile
  doré en coin d'avatar apparaît désormais aussi sur la grille de Nouvelle partie, pas seulement
  dans la liste Joueurs — cohérent avec la pré-sélection par défaut des favoris.
- **Couleur de la catégorie Merveille plus marquée** : `#a8a29e` (gris neutre) remplacé par
  `#f43f5e` (rose vif), pour mieux ressortir dans les graphiques et le tableau croisé.
- **"Comparer avec..." exclut désormais le joueur déjà sélectionné** dans Statistiques (`stats.tsx`,
  `pickerPlayers`) : impossible d'afficher deux fois les mêmes statistiques côte à côte.
- **Alerte si la permission d'accès aux photos est refusée** en créant/modifiant un joueur
  (`PlayerForm.pickAvatar`) : message explicatif, avec un raccourci vers les réglages du téléphone
  si la permission a été refusée définitivement, plutôt qu'un bouton "Changer la photo" silencieux.
- **Ordre des catégories de score d'Armada corrigé** : "Maritime" (jetons de conflit naval)
  s'intercale désormais juste après "Militaire" dans la saisie/les graphiques/le tableau, au lieu
  d'être regroupé en fin de liste avec les autres extensions ; la catégorie "islands" (cartes Îles +
  plateau individuel Armada) ferme toujours la marche mais s'affiche désormais "Armada" (libellé
  seul, id interne inchangé, pas de migration de données). Logique centralisée dans
  `getOrderedCategories()` (`constants/categories.ts`), utilisée par tous les écrans concernés au
  lieu d'un `[...BASE, ...getExtensionCategories()]` dupliqué à 5 endroits.
- **Records personnels et classement par taux de victoire en haut de Statistiques**
  (`lib/stats.ts`, `computeGlobalRecords`/`computePlayerLeaderboard`) : un encart affiche désormais
  le meilleur score jamais réalisé, la plus longue série de victoires consécutives et la partie la
  plus disputée (écart de points le plus faible entre les deux premiers), suivi d'un classement de
  tous les joueurs par taux de victoire décroissant — visible sans avoir à sélectionner un joueur,
  dans les deux vues (graphique et tableau), et recalculé selon le filtre d'extensions courant.

## UI (interface)

_Rien en attente pour l'instant._

## UX (expérience utilisateur)

- Les extensions d'une partie sont figées une fois "Lancer la partie" pressé : impossible d'en
  activer/désactiver une en cours de saisie sans abandonner et recommencer. Rare en pratique (on
  choisit ses extensions avant de sortir la boîte), mais aucun message n'explique ce verrouillage
  si quelqu'un cherche à le faire.

## Sécurité / intégrité des données

- ~~Export JSON non chiffré~~ / ~~données en clair dans AsyncStorage~~ : écartés délibérément — les
  données de l'app (prénoms, scores, liens d'images locales) ne sont pas sensibles, chiffrer
  n'apporterait rien. À reconsidérer seulement si l'app venait à stocker un jour un autre type de
  donnée.

## Optimisation du code

- Le stub de `react-native-worklets` dans `metro.config.js` (contournement d'un bug amont dans
  `@expo/ui`/`expo-router`) reste une dette technique à surveiller : si une vraie dépendance à
  `react-native-worklets` est ajoutée un jour (ex. `react-native-reanimated`), ce stub la cassera
  silencieusement. À retirer dès qu'une version corrigée d'`expo-router`/`@expo/ui` sort — rien à
  faire avant ça, ce n'est pas un bug actuel.
- `EXTRA_CATEGORIES` (`types/game.ts`) est exporté mais jamais importé ailleurs — seul le type
  `ExtraCategoryId` qu'il sert à dériver est utilisé. Un export mort à retirer ou à préfixer
  d'un commentaire expliquant qu'il n'existe que pour ça.

## Fonctionnalités

- Pas de support multilingue (tout est en français, en dur) — prévu pour plus tard, pas encore
  planifié précisément.
- Pas de fusion de joueurs en doublon (même personne créée deux fois par erreur) — décision
  assumée : deux joueurs peuvent légitimement porter le même nom, donc pas de fusion automatique ;
  seul un avertissement à la création/au renommage est affiché (voir "✅ Corrigés").
- Extensions Babel et Édifices toujours hors périmètre (décision assumée au départ, listée ici pour
  mémoire si le besoin change).
- **Idée** : partager le classement d'une partie terminée (texte simple ou image) via la feuille
  de partage système directement depuis l'écran Résultats/Historique, sans passer par l'export CSV
  complet — pratique pour envoyer le résultat du soir sur un groupe de discussion.
- **Idée** : rappel périodique (ou juste un indicateur discret) suggérant d'exporter une
  sauvegarde, puisque les données sont 100% locales sans synchronisation cloud — un changement de
  téléphone sans export préalable perd tout l'historique.
