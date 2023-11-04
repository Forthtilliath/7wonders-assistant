# TODO List par section

## Global

- [ ] Ajouter husky
- [ ] Ajouter des errors boundary
- [ ] Ajouter un gitaction pour les tests unitaires : https://docs.cypress.io/guides/continuous-integration/github-actions
- [ ] Refacto vers [Capacitor SQLite](https://github.com/capacitor-community/sqlite)

## Nouvelle partie

- [x] Gestion de la partie scientifique
- [ ] Inverser animation retour
  - [ ] Back dans store ?
- [ ] Possibilité du jeu en équipe
- [ ] Voir pour charger les données des joueurs dans NewGame via le loader

## Statistiques

## Historique des parties

- [ ] Revoir l'affichage des parties
- [ ] Limite la taille des graphes pie
- [ ] Prendre en compte dans l'history si on ajoute des nouvelles extensions

## Gestion des joueurs

- [ ] Ajouter une modal pour le delete joueur
- [ ] Voir pour charger les données du joueur dans editPlayer via le loader
- [ ] Voir pour charger les données des joueurs dans ListPlayer via le loader

## TODO Next Session

# ⚠️ A FIXER ⚠️

- [ ] Certains liens ne fonctionnent plus une fois build en static (cf new player)
- [ ] Images des joueurs par défault ne s'affichent pas sur mobile
- [ ] Responsivité About
- [ ] Bouton Add player, icone taille dynamique
- [ ] Speed click génère des doublons de composants sur les composants animés ⚠️
- [ ] Corriger duplication page quand on scroll trop vite
- [ ] Des games ont été crée je ne sais quand, mais ca faisait un bug dans le loader de GameHistory
- [ ] Bouton download ne fonctionne pas sur mobile (permissions ???)
- [ ] Fix la size des titles dans le header

# Tests Unitaires

- [x] LS :
  - [x] Vérifier la récupération des joueurs
  - [x] Vérifier la création d'un joueur
  - [x] Vérifier la modification d'un joueur
  - [x] Vérifier la suppression d'un joueur
- [ ] Affichage des joueurs :
  - [ ] Vérifier l'order des joueurs
  - [ ] Vérifier que les joueurs favoris aient l'étoile
  - [ ] Vérifier que les joueurs non favoris n'aient pas l'étoile

### Router

- [ ] `/` ➡️ **Nouvelle partie** 
  - [x] Etape 1 : *Création de la partie*
    - [x] Afficher la création de la partie
    - [x] Afficher la liste des joueurs
    - [x] Ajouter par défaut les favoris dans la partie
    - [x] Ajouter au clic un joueur dans la partie
    - [x] Bouton valider pour continuer
  - [x] Etape 2 : *Enregistrement des scores*
    - [x] Enregistre les données
  - [x] Etape 3 : *Affichage des scores*
    - [x] Redirection vers `/games/history/:idGame`
- [ ] `/statistics` ➡️ **Statistique de l'ensemble des parties** 
  - [ ] `/statistics/:idUser` ➡️ **Statisique d'un joueur**
- [x] `/history` ➡️ **Gestion des parties**
  - [x] `/history` ➡️ **Historique des parties**
  - [x] `/history/:idGame` ➡️ **Historique d'une partie**
  - [x] `/history/:idGame/save` ➡️ **Enregistrer la partie** (image/note)
  - [ ] `/history/:idGame/share` ➡️ **Partager une partie**
- [ ] `/players` ➡️ **Gestion des joueurs**
  - [ ] `/players/new` ➡️ **Nouveau joueur**
    - [x] Nom du joueur
    - [x] Ajouter aux favoris
    - [ ] Avatar
      - [ ] Prendre une photo
        - [ ] Croper l'image
        - [ ] Enregistrer l'image
      - [ ] Afficher la galerie de photos
      - [ ] Afficher l'image sélectionnée
    - [x] Redirection vers `/players`
  - [ ] `/players/edit/:idPlayer` ➡️ **Edition d'un joueur**
    - [x] Nom du joueur
    - [x] Ajouter aux favoris
    - [ ] Avatar
      - [ ] Prendre une photo
        - [ ] Croper l'image
        - [ ] Enregistrer l'image
      - [ ] Afficher la galerie de photos
      - [ ] Afficher l'image sélectionnée
    - [x] Supprimer le joueur
    - [x] Archiver le joueur
    - [x] Redirection vers `/players`
- [x] `/settings` ➡️ **Configurations**
- [x] `/feedback` ➡️ **Contacter le support**
- [x] `/rate` ➡️ **Noter l'application**
  - [ ] Rediriger vers l'application
- [x] `/about` ➡️ **A propos**