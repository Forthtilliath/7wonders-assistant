# 7 Wonders: Assistant — reprise en React Native (Expo)

## Contexte

Le projet `7wonders-assistant` (React + Vite + Capacitor) et `reactnative-scoring` (Expo, peu avancé)
n'ont jamais calculé les scores automatiquement : chaque catégorie était un simple total tapé à la
main. Le projet est repris à zéro dans ce dossier, en **React Native (Expo)**, avec cette fois un
vrai moteur de calcul (militaire, trésor, sciences avec jokers), en s'inspirant de l'architecture des
deux anciennes versions sans reprendre leur code.

Décisions validées (question à choix multiples) :
- Calcul automatique complet là où c'est possible (sciences, trésor) ; saisie directe du total pour
  Civil/Commerce/Guildes/Merveille (dépendent du plateau/cartes précises). Le militaire, après
  vérification des règles officielles, est aussi en saisie directe (voir plus bas) : dans la vraie
  partie on n'a qu'une pile de jetons Victoire/Défaite déjà valorisés à additionner, pas besoin de
  reconstituer un historique par âge.
- Extensions gérées dès le départ : Meneurs, Cités, Armada (pas Babel/Édifices).
- Périmètre = parité avec la V1 : joueurs (photo, favoris, archivage), historique, statistiques,
  export/import JSON.
- Stack : Expo (managed) + TypeScript + Expo Router, stockage 100% local (Zustand + AsyncStorage),
  Android uniquement, aucun back-end.

**Précision suite à une inquiétude légitime** : le dossier a été scaffoldé neuf via `create-expo-app`
(un seul commit "Initial commit", aucun remote configuré — vérifié par `git log`/`git remote -v`).
Aucun contenu de `7wonders-assistant` (Capacitor) n'a été copié. Le code est du React Native pur
(`react-native`, `expo-router`, pas de DOM/Capacitor). La structure de dossiers à plat (`types/`,
`stores/`, `constants/`, `lib/`, `components/`, alias `@/`) reprend volontairement la convention de
la V2 RN (`reactnative-scoring`), pas celle de la V1.

## Ce qui a déjà été construit

- **Scaffold** : Expo SDK 57 + TypeScript + Expo Router, Biome (lint/format, tabs, guillemets doubles,
  dans l'esprit du `biome.jsonc` de la V2), Jest + jest-expo pour les tests.
- **Types** (`types/game.ts`) : `Player`, `Game`, `PlayerGameEntry`, `ScienceInput`,
  extensions `leaders`/`cities`/`armada`. Militaire (`military`) et Armada (naval) sont des totaux de
  points saisis directement (jetons Victoire/Défaite déjà additionnés par le joueur, deux pools
  séparés car les jetons navals sont distincts des jetons terrestres selon les règles officielles).
- **Moteur de calcul** (`lib/scoring/`) : `treasury.ts` (pièces ÷3), `science.ts` (carrés + 7×sets,
  **optimisation automatique des jokers** par recherche exhaustive des répartitions), `total.ts`
  (agrégation + classement avec règle officielle de départage aux pièces), `game.ts` (classement à
  partir d'un `Game` stocké). **7 tests unitaires passent** (`npm test`).
- **Stores Zustand persistés (AsyncStorage)** : `playersStore`, `historyStore`, `gameStore` (partie
  en cours, avec `startNewGame`/`updateEntry`/`getRanking`/`finishGame`).
- **Écrans (Expo Router)** : accueil, CRUD joueurs (photo via `expo-image-picker`, favoris,
  archivage), nouvelle partie (sélection joueurs + extensions), saisie de score par catégorie
  (`app/game/score/[category].tsx`, un flux dynamique selon les extensions actives, avec formulaires
  dédiés trésor/sciences et saisie manuelle pour le reste, y compris militaire et armada),
  résultats/classement,
  historique (liste + détail), statistiques (par joueur : parties jouées, victoires, taux de
  victoire, score moyen/meilleur, graphique de points moyens par catégorie via
  `react-native-gifted-charts`), réglages (export/import JSON via la nouvelle API
  `expo-file-system` `File`/`Paths` + `expo-sharing`, effacement des données).

## Testé en conditions réelles

L'app tourne dans Expo Go sur un téléphone Android connecté en ADB sans fil. Trois bugs de
compatibilité SDK 57 rencontrés et corrigés en cours de route (rien lié au code métier) :
- `react-native-gifted-charts` nécessitait `expo-linear-gradient`, absent → installé.
- Une fonctionnalité expérimentale interne à `expo-router` (menu natif Android via `@expo/ui`, non
  utilisée) tirait un `react-native-worklets` dont la version installée a un bug de résolution
  interne → neutralisée via un resolver custom dans `metro.config.js`.
- `@react-native-async-storage/async-storage` était en 3.1.1 alors qu'Expo Go (SDK 57) attend la
  2.2.0, cassant silencieusement tous les stores persistés → repin sur la version attendue.

## Ce qu'il reste à faire

1. **Petits points en suspens** :
   - `expo-document-picker` a été installé par erreur avant de découvrir que
     `expo-file-system`/`File.pickFileAsync` suffit (SDK 57) ; il reste dans `package.json` sans
     être utilisé. À retirer si possible.
   - Pas d'icônes/assets personnalisés 7 Wonders (icônes par défaut Expo en place).
   - Pas de README de projet décrivant l'architecture.
2. Tester le flow complet en conditions réelles (créer des joueurs, jouer une partie, vérifier
   l'historique/les stats) — fait en partie, à poursuivre.

## Vérification

- `npm test` (7/7 tests passent sur le moteur de calcul : trésor + sciences).
- `npx tsc --noEmit` pour valider l'ensemble du typage.
- `npx biome check .` pour le style/lint.
- `npx expo start --android` pour bundler et ouvrir l'app sur un appareil Android connecté.
