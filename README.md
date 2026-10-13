<div align="center">

<img src="./assets/icon.png" alt="Logo 7 Wonders: Assistant" width="120" />

# 7 Wonders: Assistant

**L'appli qui compte les points de 7 Wonders à ta place, pendant que tu profites de la partie.**

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![Made with Expo](https://img.shields.io/badge/made%20with-Expo-000020?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform: Android](https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white)](#)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/forthtilliath)

</div>

---

Fini les additions au dos de la feuille de score. **7 Wonders: Assistant** calcule pour toi les points les plus fastidieux — sciences, militaire, trésor — pendant que tu restes concentré sur ta partie. Ajoute tes joueurs une fois, et l'appli se souvient de tout : favoris, historique, statistiques.

100% hors ligne, 100% sur ton téléphone : aucune donnée ne quitte l'appareil, sauf si tu actives la sauvegarde automatique sur ton propre Google Drive.

## 📱 En images

<table>
<tr>
<td width="33%"><img src="./docs/screenshots/jouer.png" alt="Écran de lancement d'une partie : sélection des joueurs et des extensions" /></td>
<td width="33%"><img src="./docs/screenshots/score.png" alt="Saisie du score militaire avec compteur de jetons" /></td>
<td width="33%"><img src="./docs/screenshots/resultats.png" alt="Écran de résultats avec classement et répartition des points" /></td>
</tr>
<tr>
<td align="center"><sub>Lancer une partie</sub></td>
<td align="center"><sub>Saisie des scores</sub></td>
<td align="center"><sub>Résultats & classement</sub></td>
</tr>
<tr>
<td width="33%"><img src="./docs/screenshots/statistiques.png" alt="Écran de statistiques : records et taux de victoire" /></td>
<td width="33%"><img src="./docs/screenshots/historique.png" alt="Historique des parties précédentes" /></td>
<td width="33%"><img src="./docs/screenshots/joueurs.png" alt="Gestion des joueurs et des groupes" /></td>
</tr>
<tr>
<td align="center"><sub>Statistiques</sub></td>
<td align="center"><sub>Historique</sub></td>
<td align="center"><sub>Joueurs & groupes</sub></td>
</tr>
</table>

## ✨ Fonctionnalités

- 🧮 **Calcul automatique des scores** — Sciences (optimisation des jokers comprise), Militaire et Trésor sont calculés à partir de ce que tu saisis, pas juste additionnés à la main.
- 🃏 **Extensions gérées** — Meneurs, Cités et Armada s'activent par partie, avec leurs propres catégories de score.
- 🔢 **Compteur de jetons** — pour le militaire et le maritime, compte les jetons un par un plutôt que de calculer le total toi-même.
- 👥 **Joueurs & groupes** — profils avec avatar et favoris, groupes réutilisables pour lancer une partie habituelle en un tap.
- 📜 **Historique complet** — chaque partie est enregistrée avec son classement et le détail par catégorie.
- 📊 **Statistiques** — meilleur score, plus longue série de victoires, taux de victoire par joueur, répartition des points par catégorie.
- 📤 **Partage d'une partie** — le classement en texte (pour une messagerie), en image ou en CSV, directement depuis les résultats ou l'historique.
- ☁️ **Sauvegarde automatique Google Drive (optionnelle)** — une fois ton compte relié, tes données sont envoyées après chaque partie dans un dossier privé de l'app sur ton Drive, et restaurables sur un nouveau téléphone.
- 💾 **Sauvegarde & export** — export/import JSON pour changer d'appareil (avec annulation de la dernière restauration), chiffrement optionnel des sauvegardes, export CSV pour ouvrir tes scores dans un tableur, et un rappel discret quand des parties n'ont pas été sauvegardées.
- 🔄 **Mises à jour intégrées** — Réglages ▸ À propos vérifie la dernière version publiée sur GitHub, la télécharge et la confie à l'installeur d'Android.
- 📴 **Hors ligne** — aucun compte obligatoire, aucun serveur : sans Google Drive, toutes les données restent sur le téléphone.
- 🌗 **Thème clair / sombre**.

## 🛠️ Stack technique

[Expo](https://expo.dev) (React Native) · [TypeScript](https://www.typescriptlang.org/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [Zustand](https://github.com/pmndrs/zustand) · AsyncStorage · [Biome](https://biomejs.dev/) · Jest · [Testing Library](https://callstack.github.io/react-native-testing-library/)

## 🚀 Démarrer le projet

Prérequis : [Node.js](https://nodejs.org/), un émulateur Android ou un téléphone en debug USB.

```bash
# Installer les dépendances
npm install

# Lancer le serveur de dev
npx expo start

# Ou build + installer directement sur un appareil/émulateur Android connecté
npx expo run:android
```

Autres commandes utiles :

```bash
npm test     # tests unitaires et fonctionnels (Jest + Testing Library)
npm run lint # vérification du code (Biome)
```

### Configurer la sauvegarde Google Drive

La sauvegarde automatique utilise [Google Sign-In](https://react-native-google-signin.github.io/) et l'API Google Drive (scope `drive.appdata` : l'app n'accède qu'à son propre dossier caché, jamais aux autres fichiers du Drive). Pas de serveur ni de clé dans le code, mais un client OAuth doit être déclaré une fois dans la [console Google Cloud](https://console.cloud.google.com/) :

1. Créer un projet, puis activer l'**API Google Drive** (*API et services ▸ Bibliothèque*).
2. Configurer l'**écran de consentement OAuth** (type *Externe*), ajouter le scope `.../auth/drive.appdata`, puis le **publier en production** : en mode *Test*, l'accès expire au bout de 7 jours et seuls les testeurs déclarés peuvent se connecter.
3. Créer un **ID client OAuth de type Android** avec le nom de package `com.forth.reactnative7wondersassistant` et l'empreinte **SHA-1 de la clé qui signe l'APK** (`cd android && ./gradlew signingReport`). Une empreinte par clé de signature : en ajouter un second si les APK de dev et de release sont signés différemment.

Aucun identifiant à recopier dans l'app : Google reconnaît le client à partir du package et de la signature de l'APK. Un client mal configuré se traduit par l'erreur « La connexion à Google a échoué » au moment de relier le compte.

La clé de debug étant publique (la même dans tous les projets React Native), le client OAuth qui porte sa SHA-1 n'est à garder que pour le développement : n'importe qui peut signer un APK avec cette clé.

### Signer l'APK de release

L'APK de release est signé avec une clé propre au projet, jamais avec le `debug.keystore` public de React Native (plugin `withReleaseSigning` de [`@forthtilliath/expo-config-plugins`](https://www.npmjs.com/package/@forthtilliath/expo-config-plugins)). Sans cette clé, `gradlew assembleRelease` échoue (« Keystore file not set »).

1. Générer la clé une seule fois, **hors du dépôt**, et la sauvegarder (gestionnaire de mots de passe, stockage chiffré) : la perdre empêche toute mise à jour de l'app installée.

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

Android refuse d'installer par-dessus une app signée avec une autre clé : le passage à la clé de release oblige à désinstaller l'ancienne version (données locales effacées). Faire une sauvegarde (Google Drive ou export JSON) avant, puis la restaurer.

## 🎯 Périmètre

Toutes les catégories ne se calculent pas de la même façon, et c'est voulu : Sciences, Militaire et Trésor sont calculés automatiquement à partir de ce que tu comptes sur ton plateau ; Civil, Commerce, Guildes et Merveille restent en saisie directe du total, car ils dépendent des cartes précises jouées — pas de deuxième jeu de règles à maintenir en synchro avec les vraies cartes. Les extensions Babel et Édifices ne sont pas gérées.

## ☕ Soutenir le projet

Si l'appli te fait gagner du temps en soirée jeux, tu peux [m'offrir un café](https://buymeacoffee.com/forthtilliath).

## 📄 Licence

Distribué sous licence [MIT](./LICENSE).
