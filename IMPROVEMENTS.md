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

## UI (interface)

- Icônes et splash screen encore ceux par défaut d'Expo (pas d'identité visuelle 7 Wonders).
- Thème unique sombre : pas d'option thème clair (choix assumé au départ, mais à raviser si demandé).
- Catégories identifiées seulement par un point de couleur — des petites icônes thématiques
  (épée pour militaire, pièce pour trésor, tour pour merveille...) aideraient à la lecture rapide,
  surtout dans les graphiques et le tableau croisé.
- Chaque avatar joueur sans photo utilise la même couleur de fond — attribuer une couleur distincte
  par joueur faciliterait le repérage visuel dans les tableaux/graphiques multi-joueurs.
- Chips d'extension ("Sans extension" notamment) qui passent sur deux lignes selon la largeur d'écran.
- Pas d'animation/transition personnalisée entre écrans (transitions par défaut d'Expo Router).
- `NumberStepper` : pas d'accélération en appui long sur +/- pour saisir rapidement de grandes valeurs.

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

- Validation d'import assez superficielle (vérifie que `players`/`history` sont des tableaux, mais
  pas la forme de chaque entrée) : un fichier corrompu ou modifié à la main pourrait planter l'app
  au rendu plutôt que d'être rejeté proprement à l'import. Une validation de schéma (zod ou
  équivalent) sécuriserait ce point.
- Export en JSON non chiffré partagé via la feuille de partage système : peut atterrir dans un
  cloud/autre app. Pour des scores de jeu de société, le risque est faible, mais à garder en tête
  si l'app évolue vers des données plus sensibles.
- Données stockées en clair dans AsyncStorage (standard React Native, pas un stockage sécurisé) —
  sans enjeu aujourd'hui vu la nature des données.

## Optimisation du code

- L'I/O fichier de `lib/backup.ts` (lecture/écriture via `expo-file-system`, `restoreSafetyBackup`)
  n'est pas testée — nécessiterait de mocker `expo-file-system`/`expo-sharing`. Seule sa logique pure
  extraite dans `lib/backupSchema.ts` l'est.
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

- Pas d'export CSV (seulement JSON) pour ouvrir les scores dans un tableur.
- Pas d'action "rejouer avec les mêmes joueurs/extensions" depuis l'historique.
- Pas de support multilingue (tout est en français, en dur) — cohérent avec la préférence actuelle,
  à revoir seulement si le besoin apparaît.
- Aucun attribut d'accessibilité (`accessibilityLabel`/`accessibilityRole`) sur les boutons et
  chips personnalisés : l'app n'est pas utilisable avec un lecteur d'écran (TalkBack) en l'état.
- Pas de mode "jetons" en plus du mode "total direct" pour militaire/armada, pour les joueurs qui
  préfèrent compter jeton par jeton plutôt que de calculer le total dans leur tête (l'app fait déjà
  ce choix consciemment simple, mais ça pourrait être une option plutôt qu'un seul mode imposé).
- Pas de fusion de joueurs en doublon (même personne créée deux fois par erreur).
- Extensions Babel et Édifices toujours hors périmètre (décision assumée au départ, listée ici pour
  mémoire si le besoin change).
