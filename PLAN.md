# 7 Wonders: Assistant — reprise en React Native (Expo)

## Contexte

Le projet `7wonders-assistant` (React + Vite + Capacitor) et `reactnative-scoring` (Expo, peu avancé)
n'ont jamais calculé les scores automatiquement : chaque catégorie était un simple total tapé à la
main. Le projet est repris à zéro dans ce dossier, en **React Native (Expo)**, avec cette fois un
vrai moteur de calcul (militaire, trésor, sciences avec jokers), en s'inspirant de l'architecture des
deux anciennes versions sans reprendre leur code.

Décisions validées (question à choix multiples) :
- Calcul automatique complet là où c'est possible (sciences, militaire, trésor) ; saisie directe du
  total pour Civil/Commerce/Guildes/Merveille (dépendent du plateau/cartes précises).
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
- **Types** (`types/game.ts`) : `Player`, `Game`, `PlayerGameEntry`, `MilitaryInput`, `ScienceInput`,
  extensions `leaders`/`cities`/`armada`.
- **Moteur de calcul** (`lib/scoring/`) : `military.ts` (1/3/5 pts par âge, -1 défaite),
  `treasury.ts` (pièces ÷3), `science.ts` (carrés + 7×sets, **optimisation automatique des jokers**
  par recherche exhaustive des répartitions), `total.ts` (agrégation + classement avec règle
  officielle de départage aux pièces), `game.ts` (classement à partir d'un `Game` stocké).
  **11 tests unitaires passent** (`npm test`), y compris les cas de répartition de jokers.
- **Stores Zustand persistés (AsyncStorage)** : `playersStore`, `historyStore`, `gameStore` (partie
  en cours, avec `startNewGame`/`updateEntry`/`getRanking`/`finishGame`).
- **Écrans (Expo Router)** : accueil, CRUD joueurs (photo via `expo-image-picker`, favoris,
  archivage), nouvelle partie (sélection joueurs + extensions), saisie de score par catégorie
  (`app/game/score/[category].tsx`, un flux dynamique selon les extensions actives, avec formulaires
  dédiés militaire/trésor/sciences et saisie manuelle pour le reste), résultats/classement,
  historique (liste + détail), statistiques (par joueur : parties jouées, victoires, taux de
  victoire, score moyen/meilleur, graphique de points moyens par catégorie via
  `react-native-gifted-charts`), réglages (export/import JSON via la nouvelle API
  `expo-file-system` `File`/`Paths` + `expo-sharing`, effacement des données).

## Ce qu'il reste à faire

1. **Vérifier que le projet compile** : `npx tsc --noEmit` et corriger les éventuelles erreurs.
2. **Vérifier le lint** : `npx biome check .` et corriger si besoin.
3. **Fumée de démarrage** : `npx expo start` (vérifier que Metro bundle sans erreur ; test réel sur
   émulateur/appareil Android à faire par l'utilisateur).
4. **Petits points en suspens** :
   - `expo-document-picker` a été installé par erreur avant de découvrir que
     `expo-file-system`/`File.pickFileAsync` suffit (SDK 57) ; il reste dans `package.json` sans
     être utilisé. À retirer si possible.
   - Pas d'icônes/assets personnalisés 7 Wonders (icônes par défaut Expo en place).
   - Pas de README de projet décrivant l'architecture.
5. Committer le travail par commits granulaires (Conventional Commits, sans corps long, sans mention
   Claude).

## Vérification

- `npm test` (11/11 tests passent sur le moteur de calcul).
- `npx tsc --noEmit` pour valider l'ensemble du typage.
- `npx biome check .` pour le style/lint.
- `npx expo start` pour confirmer que l'app bundle (test manuel sur appareil Android à faire par
  l'utilisateur pour la validation visuelle finale).
