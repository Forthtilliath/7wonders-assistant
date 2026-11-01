# Documentation développeur

Tout ce qu'il faut pour faire tourner, comprendre et publier **7 Wonders: Assistant**. La présentation de l'appli côté utilisateur est dans le [README principal](../README.md).

## 📑 Sommaire

- [Stack](#️-stack)
- [Démarrer](#-démarrer)
- [Organisation du code](#️-organisation-du-code)
- [Déroulé d'une partie](#-déroulé-dune-partie)
- [Calcul des scores](#-calcul-des-scores)
- [État et persistance](#-état-et-persistance)
- [Sauvegarde et import](#-sauvegarde-et-import)
- [Configurer la sauvegarde Google Drive](#️-configurer-la-sauvegarde-google-drive)
- [Mises à jour intégrées](#-mises-à-jour-intégrées)
- [Tests](#-tests)
- [Signer l'APK de release](#-signer-lapk-de-release)
- [Publier une version](#-publier-une-version)
- [Captures d'écran du README](#-captures-décran-du-readme)

## 🛠️ Stack

[Expo](https://expo.dev) SDK 58 (React Native 0.88) · [TypeScript](https://www.typescriptlang.org/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [Zustand](https://github.com/pmndrs/zustand) + AsyncStorage · [zod](https://zod.dev/) 4 · [Biome](https://biomejs.dev/) · Jest · [Testing Library](https://callstack.github.io/react-native-testing-library/)

Paquets maison (tous en import profond, `@forthtilliath/<paquet>/<chemin>`) :

| Paquet | Usage |
| --- | --- |
| [`react-native-kit`](https://github.com/Forthtilliath/forthtilliath-packages/tree/main/packages/react-native-kit#readme) | `BottomSheet`, `ReorderList` (ordre des joueurs), `Button` / `TextField` / `SegmentedToggle` / `CheckboxGroup` (via les adaptateurs de `components/ui/`), `SettingsCard`, `usePressRepeat`, `useViewShare` (partage en image), `usePersistHydrated`, retours haptiques, vignettes des avatars |
| [`ts-kit`](https://github.com/Forthtilliath/forthtilliath-packages/tree/main/packages/ts-kit#readme) | saisie des entiers (`parseIntegerInput`, `sanitizeIntegerInput`), échappement CSV, horodatage des fichiers exportés |
| [`expo-backup`](https://github.com/Forthtilliath/forthtilliath-packages/tree/main/packages/expo-backup#readme) / `expo-backup-ui` | Google Drive, export / import de fichier, chiffrement, annulation de la restauration, rappel de sauvegarde |
| [`expo-release-updates`](https://github.com/Forthtilliath/forthtilliath-packages/tree/main/packages/expo-release-updates#readme) / `expo-release-updates-ui` | recherche, téléchargement vérifié et installation des mises à jour |
| [`expo-config-plugins`](https://github.com/Forthtilliath/forthtilliath-packages/tree/main/packages/expo-config-plugins#readme) | signature release, ABI ARM |

Cible : **Android uniquement**, identifiant `com.forthtilliath.sevenwondersassistant`.

## 🚀 Démarrer

Prérequis : [Node.js](https://nodejs.org/), le SDK Android (via Android Studio), et un émulateur ou un téléphone en débogage USB.

```bash
npm install          # dépendances
npx expo run:android # build natif + installation sur l'appareil connecté
npx expo start       # serveur de dev seul, une fois l'appli de dev installée
```

| Commande | Rôle |
| --- | --- |
| `npm test` | Tests unitaires et de composants (Jest + Testing Library) |
| `npm run lint` | Vérification du code (Biome, lint + format) |
| `npm run format` | Correction automatique (Biome) |
| `npx tsc --noEmit` | Vérification des types |

Le dossier `android/` est généré par `expo prebuild` et n'est pas suivi par git : toute config native passe par `app.json` et des config plugins, jamais par une modification à la main dans `android/`.

Le dépôt n'a pas de CI : lancer les trois vérifications ci-dessus avant chaque push.

## 🗂️ Organisation du code

```
app/                    Écrans (Expo Router)
  (tabs)/index.tsx        Jouer : joueurs, groupes, ordre, édition et extensions
  (tabs)/game/            Saisie (score/[category].tsx, une étape par catégorie) et résultats
  (tabs)/players.tsx      Joueurs et groupes ; players/[id], groups/[id] pour les fiches
  (tabs)/history.tsx      Historique ; history/[id] pour le détail
  (tabs)/stats.tsx        Statistiques
  (tabs)/settings/        Apparence, édition par défaut, merveilles, sauvegardes, nouveautés,
                          dons, à propos, zone dangereuse
components/             Composants par domaine (game, history, stats, backup, players, groups,
                        wonders, settings, updates) + ui/ (adaptateurs minces du kit)
stores/                 Stores Zustand persistés (partie en cours, historique, joueurs, groupes,
                        merveilles perso, préférences, thème, sauvegarde, mises à jour)
lib/                    Logique pure, sans React
  scoring/                sciences (jokers), jetons, Babel, totaux d'une partie
  backup.ts, backupSchema.ts  gestionnaire de sauvegarde, migrations, schéma zod
  stats.ts, gameFilters.ts    statistiques et filtres
  shareGame.ts, shareLayout.ts, csv.ts  partage texte / image / CSV
  categoryFlow.ts         ordre des étapes selon les extensions
  updates.ts              mises à jour vérifiées
hooks/                  couleurs du thème, sauvegarde auto Google Drive, avatars, capture d'image
constants/              catégories, éditions, merveilles, règles, thème, notes de version
types/                  types métier (Player, Game, PlayerGameEntry, CustomWonder…)
__tests__/              tests fonctionnels ; les tests unitaires sont à côté du code
```

Principes :

- **La logique va dans `lib/`**, testée unitairement ; les composants restent fins.
- **Pas de fichier de plus de 300 lignes** : au-delà, découper en sous-composants.
- **Tout import de données est validé** avant d'être appliqué (voir [Sauvegarde et import](#-sauvegarde-et-import)).

## 🎲 Déroulé d'une partie

1. **Jouer** (`app/(tabs)/index.tsx`) : sélection des joueurs (ou d'un groupe, qui lance la partie aussitôt), ordre (liste réordonnable du kit), édition et extensions. `constants/editions.ts` filtre les extensions par édition (Babel : 1re seulement) et signale le mélange Babel + Edifice.
2. **Saisie** (`app/(tabs)/game/score/[category].tsx`) : `lib/categoryFlow.ts` donne l'ordre des étapes — les 7 catégories de base, puis Leaders, Cities, Babel, Maritime et Armada selon les extensions (Edifice n'ajoute pas d'étape). Le bouton de réglages de l'en-tête modifie les extensions en cours de partie ; le compteur de jetons (`TokenCounterSheet`) existe pour Militaire et Maritime.
3. **Résultats** (`app/(tabs)/game/results.tsx`) : classement, répartition, partage, « Corriger la partie » (retour à la saisie), puis `finishGame` qui range la partie en tête de l'historique.

La partie en cours vit dans `stores/gameStore.ts` (persisté) : fermer l'appli ne perd rien, et l'onglet Jouer propose de reprendre ou d'abandonner.

## 🧮 Calcul des scores

Règles dans [`lib/scoring/`](../lib/scoring/), testées dans `lib/scoring/__tests__` :

- **Sciences** (`science.ts`) : chaque type rapporte le carré de son nombre, plus 7 points par série complète (roue + compas + tablette). Les « symboles max » copient d'abord le type déjà dominant (sans choix), puis les jokers sont répartis entre les trois types pour **maximiser** le score. Les compteurs sont bornés (`MAX_SCIENCE_SYMBOLS`, `constants/game.ts`) : ils pilotent une recherche exhaustive.
- **Jetons** (`tokens.ts`) : militaires (+1 / +3 / +5, −1) et navals.
- **Babel** (`babel.ts`) : 0, 1, 2 ou 3 tuiles → 0, 2, 5 ou 10 points.
- **Totaux** (`game.ts`, `total.ts`) : somme par joueur, classement.
- Trésor, Civil, Commerce, Guildes, Merveille, Leaders, Cities et Armada sont des totaux saisis tels quels (`MIN_POINTS` … `MAX_POINTS`) : ils dépendent des cartes jouées.

## 💾 État et persistance

- Un store Zustand par domaine (`stores/`), persisté dans AsyncStorage. Chaque store a sa propre `version` de persistance et **une étape de conversion par version** (`*_STORE_MIGRATIONS`, ex. renommage des catégories Armada dans `gameStore.ts`), appliquées une à une par `createStoreMigrate` ([`lib/persistedState.ts`](../lib/persistedState.ts)).
- **Rien n'est effacé en silence** : avant toute conversion, l'état enregistré est copié tel quel dans le dossier `secours/` de l'appli ([`lib/rescueCopies.ts`](../lib/rescueCopies.ts)). Si la conversion est impossible (étape manquante, données d'une version plus récente), le store démarre vide et une alerte au lancement propose d'exporter la copie (`hooks/useDataIssuesAlert.ts`). Les réglages propres à l'appareil (thème, préférences, rappel, mises à jour) reviennent simplement à leur valeur par défaut.
- Monter la `version` d'un store sans ajouter son étape fait échouer `stores/__tests__/storeMigrations.test.ts`.
- L'historique est stocké **de la plus récente à la plus ancienne** (`addGame` insère en tête) ; l'écran l'affiche dans cet ordre, sans tri.
- `usePersistHydrated` (kit) attend la réhydratation avant d'afficher les écrans qui en dépendent.
- `android.allowBackup: false` (`app.json`) : la sauvegarde automatique d'Android ne copie pas les données hors du téléphone.

## 📦 Sauvegarde et import

[`lib/backup.ts`](../lib/backup.ts) crée le gestionnaire `expo-backup` (chiffrement **facultatif**, clé générée par l'appli, gardée sur le téléphone et dans le Drive, clé de secours affichable) ; les écrans viennent d'`expo-backup-ui`.

- **Contenu** (`BackupData`, `lib/backupSchema.ts`) : joueurs, historique, groupes, avatars en JPEG base64, merveilles et extensions non officielles. Une restauration remplace tout et peut être annulée juste après.
- **Import** : `parseBackupContent` → contrôle de la forme générale (`isBackupDataShape`) → **migrations** (`MIGRATIONS`, de `dataVersion` jusqu'à `DATA_VERSION`) → **schéma zod par entrée** (`validateMigratedBackupData` : types, bornes, enums, longueurs, nombre d'entrées, base64 des avatars, cohérence merveilles / extensions). Les clés inconnues sont retirées, et la première anomalie rejette le fichier entier avec un message affichable (champ + raison).
- **Format versionné** : toute modification de forme de `Player`, `Game`, `PlayerGameEntry` ou `PlayerGroup` incrémente `DATA_VERSION` et ajoute une étape dans `MIGRATIONS`, avec ses tests (`lib/__tests__/backup*.test.ts`). Un champ ajouté et facultatif (comme `avatars` ou `customWonders`) peut s'en passer : une version plus ancienne de l'appli l'ignore.
- **Rappel de sauvegarde** : `BackupReminderBanner` (`shouldShowBackupReminder` d'`expo-backup`) quand rien n'a été sauvegardé depuis un moment.

## ☁️ Configurer la sauvegarde Google Drive

La sauvegarde automatique utilise [Google Sign-In](https://react-native-google-signin.github.io/) et l'API Google Drive (scope `drive.appdata` : l'appli n'accède qu'à son propre dossier caché, jamais aux autres fichiers du Drive). Pas de serveur ni de clé dans le code, mais un client OAuth doit être déclaré une fois dans la [console Google Cloud](https://console.cloud.google.com/) :

1. Créer un projet, puis activer l'**API Google Drive** (*API et services ▸ Bibliothèque*).
2. Configurer l'**écran de consentement OAuth** (type *Externe*), ajouter le scope `.../auth/drive.appdata`, puis le **publier en production** : en mode *Test*, l'accès expire au bout de 7 jours et seuls les testeurs déclarés peuvent se connecter.
3. Créer un **ID client OAuth de type Android** avec le nom de package `com.forthtilliath.sevenwondersassistant` et l'empreinte **SHA-1 de la clé qui signe l'APK** (`cd android && ./gradlew signingReport`). Une empreinte par clé de signature : en ajouter un second client si les APK de dev et de release sont signés différemment.

Aucun identifiant à recopier dans l'appli : Google reconnaît le client à partir du package et de la signature de l'APK. Un client mal configuré se traduit par l'erreur « La connexion à Google a échoué » au moment de relier le compte.

> [!WARNING]
> La clé de debug est publique (la même dans tous les projets React Native). Le client OAuth qui porte sa SHA-1 ne sert qu'au développement : n'importe qui peut signer un APK avec cette clé.

## 🔄 Mises à jour intégrées

[`lib/updates.ts`](../lib/updates.ts) (dépôt `RELEASES_REPO`, `constants/app.ts`) :

- `fetchLatestRelease` ne propose que les releases dont GitHub fournit l'**empreinte SHA-256** de l'APK (`requireVerifiedApk`) : une release sans empreinte est ignorée ;
- le téléchargement n'accepte que les URL des releases du dépôt (`allowedUrlPrefix`) et vérifie le SHA-256 du fichier (`expectedSha256`) avant de le confier à l'installeur d'Android, qui refuse en plus un APK signé avec une autre clé ;
- la permission `REQUEST_INSTALL_PACKAGES` ne sert qu'à cette installation.

Le bouton « Vérifier les mises à jour » est dans *Réglages ▸ Nouveautés* et *Réglages ▸ À propos*.

## 🧪 Tests

```bash
npm test
```

Jest + Testing Library. Les règles de calcul (`lib/scoring`), les statistiques, le partage, les migrations et les bornes de l'import ont leurs tests unitaires à côté du code ; `__tests__/` à la racine contient les tests fonctionnels des écrans. Les modules natifs (fichiers, partage, Google Sign-In) sont simulés.

## 🔑 Signer l'APK de release

L'APK de release est signé avec une clé propre au projet, jamais avec le `debug.keystore` public de React Native (plugin `withReleaseSigning` de [`@forthtilliath/expo-config-plugins`](https://www.npmjs.com/package/@forthtilliath/expo-config-plugins)). Sans cette clé, `gradlew assembleRelease` échoue (« Keystore file not set »).

1. Générer la clé une seule fois, **hors du dépôt**, et la sauvegarder (gestionnaire de mots de passe, stockage chiffré) : la perdre empêche toute mise à jour de l'appli installée.

   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keyalg RSA -keysize 2048 -validity 10000 -alias sevenwonders-upload -keystore ~/keys/sevenwonders-upload.keystore
   ```

2. Déclarer son emplacement et ses mots de passe dans `~/.gradle/gradle.properties` (jamais dans `android/gradle.properties`, régénéré par `expo prebuild`) :

   ```properties
   SEVENWONDERS_UPLOAD_STORE_FILE=C:/Users/<toi>/keys/sevenwonders-upload.keystore
   SEVENWONDERS_UPLOAD_STORE_PASSWORD=...
   SEVENWONDERS_UPLOAD_KEY_ALIAS=sevenwonders-upload
   SEVENWONDERS_UPLOAD_KEY_PASSWORD=...
   ```

   En CI, les mêmes valeurs passent par des variables d'environnement `ORG_GRADLE_PROJECT_SEVENWONDERS_UPLOAD_…`.

3. Ajouter la SHA-1 de cette clé (`keytool -list -v -keystore <fichier>` ou `cd android && ./gradlew signingReport`) à un client OAuth Android dans la console Google Cloud (voir ci-dessus).

Android refuse d'installer par-dessus une appli signée avec une autre clé : le passage à la clé de release oblige à désinstaller l'ancienne version (données locales effacées). Faire une sauvegarde (Google Drive ou export) avant, puis la restaurer.

## 🚢 Publier une version

1. Incrémenter `version` dans `app.json` et `package.json`, et ajouter les notes de version dans `constants/changelog.ts` (affichées dans *Réglages ▸ Nouveautés*).
2. Vérifier en local : `npm run lint`, `npx tsc --noEmit`, `npm test`.
3. Construire l'APK signé :

   ```bash
   npx expo prebuild --platform android
   cd android && ./gradlew assembleRelease
   ```

   > [!NOTE]
   > Sous Windows, la compilation C++ de `react-native-worklets` dépasse la limite de 260 caractères des chemins avec le CMake 3.22 par défaut (`ninja: error: mkdir(...): No such file or directory`). Installer CMake 4.x (*SDK Manager ▸ SDK Tools ▸ CMake*) et l'indiquer dans `android/local.properties`, à refaire après chaque `expo prebuild --clean` :
   >
   > ```properties
   > cmake.dir=C\:\\Users\\<toi>\\AppData\\Local\\Android\\Sdk\\cmake\\4.1.2
   > ```

4. Renommer `android/app/build/outputs/apk/release/app-release.apk` en `7WondersAssistant-<version>.apk`, puis créer la release GitHub avec le tag `v<version>` :

   ```bash
   gh release create v<version> 7WondersAssistant-<version>.apk --title "v<version>" --notes "…"
   ```

L'updater intégré lit la **dernière release** du dépôt et prend son fichier `.apk`, à condition que GitHub en donne l'empreinte SHA-256 (c'est le cas des fichiers envoyés par `gh release create`). Le nom du fichier est libre pour l'updater, mais garder `7WondersAssistant-<version>.apk` pour les téléchargements manuels.

## 📸 Captures d'écran du README

Les captures de [`screenshots/`](screenshots/) viennent de l'émulateur Pixel 6 (1080 × 2400), réduites à 540 × 1200, avec des données fictives :

1. Build release pour l'émulateur (les APK publiés, ARM uniquement, ne démarrent pas sur un émulateur x86_64) :
   ```bash
   npx expo prebuild --platform android
   cd android && ./gradlew assembleRelease -PreactNativeArchitectures=x86_64
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```
2. Sauvegarde de démonstration en clair (`dataVersion` 6 : 7 joueurs fictifs, 2 groupes, 12 parties de juin à octobre 2026, **de la plus récente à la plus ancienne** comme l'historique), poussée par `adb push demo.json /sdcard/Download/` puis importée par *Réglages ▸ Gestion des sauvegardes ▸ Importer une sauvegarde*. Une partie est ensuite saisie à la main pour les écrans de saisie et de résultats.
3. Barre d'état en mode démo :
   ```bash
   adb shell settings put global sysui_demo_allowed 1
   adb shell am broadcast -a com.android.systemui.demo -e command enter
   adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 2030
   adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
   ```
4. `adb shell screencap -p /sdcard/s.png` puis `adb pull /sdcard/s.png`, réduire à 540 × 1200.
