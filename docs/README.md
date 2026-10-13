# Documentation développeur

Tout ce qu'il faut pour faire tourner, comprendre et publier **7 Wonders: Assistant**. La présentation de l'appli côté utilisateur est dans le [README principal](../README.md).

## 🛠️ Stack

[Expo](https://expo.dev) SDK 57 (React Native 0.86) · [TypeScript](https://www.typescriptlang.org/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [Zustand](https://github.com/pmndrs/zustand) + AsyncStorage · [zod](https://zod.dev/) · [Biome](https://biomejs.dev/) · Jest · [Testing Library](https://callstack.github.io/react-native-testing-library/)

Cible : **Android uniquement**.

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

## 🗂️ Organisation du code

```
app/            Écrans (Expo Router) : onglets, joueurs, groupes, historique, réglages
components/     Composants par domaine (game, history, stats, backup, settings…) + ui/ génériques
stores/         Stores Zustand persistés dans AsyncStorage (joueurs, parties, groupes, préférences…)
lib/            Logique pure, sans React : calcul des scores, statistiques, CSV, partage, sauvegardes
lib/scoring/    Règles de calcul : sciences (jokers), jetons, totaux
hooks/          Hooks transverses (couleurs du thème, sauvegarde auto Google Drive, avatars)
constants/      Catégories, règles du jeu, thème, notes de version affichées dans l'appli
types/          Types métier (Player, Game, PlayerGameEntry…)
__tests__/      Tests fonctionnels ; les tests unitaires sont à côté du code (__tests__/ par dossier)
```

Principes :

- **La logique va dans `lib/`**, testée unitairement ; les composants restent fins.
- **Pas de fichier de plus de 300 lignes** : au-delà, découper en sous-composants.
- **Tout import de données est validé** avant d'être appliqué : `lib/backupSchema.ts` décrit chaque entrée avec un schéma zod (types, bornes, enums, longueurs) ; à la première anomalie, le fichier entier est rejeté et rien n'est modifié. Les clés inconnues sont supprimées.
- **Format de sauvegarde versionné** : toute modification de forme de `Player`, `Game`, `PlayerGameEntry` ou `PlayerGroup` incrémente `DATA_VERSION` et ajoute une étape dans `MIGRATIONS` (`lib/backupSchema.ts`). Les stores Zustand ont leur propre `version` de persistance, à migrer aussi.

Les sauvegardes (Drive, fichier, chiffrement) et les mises à jour intégrées s'appuient sur mes bibliothèques [`@forthtilliath/expo-backup`](https://www.npmjs.com/package/@forthtilliath/expo-backup) et [`@forthtilliath/expo-release-updates`](https://www.npmjs.com/package/@forthtilliath/expo-release-updates).

## ☁️ Configurer la sauvegarde Google Drive

La sauvegarde automatique utilise [Google Sign-In](https://react-native-google-signin.github.io/) et l'API Google Drive (scope `drive.appdata` : l'appli n'accède qu'à son propre dossier caché, jamais aux autres fichiers du Drive). Pas de serveur ni de clé dans le code, mais un client OAuth doit être déclaré une fois dans la [console Google Cloud](https://console.cloud.google.com/) :

1. Créer un projet, puis activer l'**API Google Drive** (*API et services ▸ Bibliothèque*).
2. Configurer l'**écran de consentement OAuth** (type *Externe*), ajouter le scope `.../auth/drive.appdata`, puis le **publier en production** : en mode *Test*, l'accès expire au bout de 7 jours et seuls les testeurs déclarés peuvent se connecter.
3. Créer un **ID client OAuth de type Android** avec le nom de package `com.forthtilliath.sevenwondersassistant` et l'empreinte **SHA-1 de la clé qui signe l'APK** (`cd android && ./gradlew signingReport`). Une empreinte par clé de signature : en ajouter un second client si les APK de dev et de release sont signés différemment.

Aucun identifiant à recopier dans l'appli : Google reconnaît le client à partir du package et de la signature de l'APK. Un client mal configuré se traduit par l'erreur « La connexion à Google a échoué » au moment de relier le compte.

> [!WARNING]
> La clé de debug est publique (la même dans tous les projets React Native). Le client OAuth qui porte sa SHA-1 ne sert qu'au développement : n'importe qui peut signer un APK avec cette clé.

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

## 📦 Publier une version

1. Incrémenter `version` dans `app.json` et `package.json`, et ajouter les notes de version dans `constants/changelog.ts`.
2. Vérifier en local : `npm run lint`, `npx tsc --noEmit`, `npm test`.
3. Construire l'APK signé :

   ```bash
   npx expo prebuild --platform android
   cd android && ./gradlew assembleRelease
   ```

4. Renommer `android/app/build/outputs/apk/release/app-release.apk` en `7WondersAssistant-<version>.apk`, puis créer la release GitHub avec le tag `v<version>` :

   ```bash
   gh release create v<version> 7WondersAssistant-<version>.apk --title "v<version>" --notes "…"
   ```

L'updater intégré (*Réglages ▸ À propos*) lit la **dernière release** du dépôt et télécharge le premier fichier `.apk` qu'elle contient : le nom du fichier est libre, mais une release sans `.apk` n'est pas proposée en mise à jour.
