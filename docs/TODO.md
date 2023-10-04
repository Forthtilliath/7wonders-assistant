- [x] Faire le menu
- [x] Faire le routage
- [x] Ajouter les headers de chaque page
- [x] Mettre le header dans le layout et récupérer le title dans les data

- [ ] Modifier les contexts en stores
- [ ] Remplacer framer-motion !
  - [ ] Back dans store pour inverser animation exit ?
- [ ] Ajouter prettier/eslint
- [ ] Ajouter husky
- [x] Ajouter prettier sort
- [ ] Ajouter des errors boundary
- [ ] Vérifier utilité de sharp
- [ ] Ajouter une icone pour l'app
- [ ] Ajouter une modal pour le delete joueur
- [ ] Ajouter une bordure à l'icone Favorite
- [ ] Les pages Settings, Feedback et About ont un bouton retour 
- [ ] Ajouter un gitaction pour les tests unitaires : https://docs.cypress.io/guides/continuous-integration/github-actions

- [ ] Possibilité d'enregistrer les données dans un fichier
  - [ ] des joueurs
  - [ ] des parties
- [ ] Possibilité de charger les données à partir d'un fichier

# ⚠️ A FIXER ⚠️

- [ ] Certains liens ne fonctionnent plus une fois build en static (cf new player)

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
  - [ ] Etape 1 : *Création de la partie*
    - [ ] Afficher la création de la partie
    - [ ] Afficher la liste des joueurs
    - [ ] Ajouter par défaut les favoris dans la partie
    - [ ] Ajouter au clic un joueur dans la partie
    - [ ] Bouton valider pour continuer
  - [ ] Etape 2 : *Enregistrement des scores*
    - [ ] Enregistre les données
  - [ ] Etape 3 : *Affichage des scores*
    - [ ] Redirection vers `/games/history/:idGame`
- [ ] `/statistics` ➡️ **Statistique de l'ensemble des parties** 
  - [ ] `/statistics/:idUser` ➡️ **Statisique d'un joueur**
- [ ] `/history` ➡️ **Gestion des parties**
  - [ ] `/history` ➡️ **Historique des parties**
  - [ ] `/history/:idGame` ➡️ **Historique d'une partie**
  - [ ] `/history/:idGame/save` ➡️ **Enregistrer la partie** (image/note)
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
    - [ ] Archiver le joueur
    - [x] Redirection vers `/players`
- [x] `/settings` ➡️ **Configurations**
- [x] `/feedback` ➡️ **Contacter le support**
- [x] `/rate` ➡️ **Noter l'application**
  - [ ] Rediriger vers l'application
- [x] `/about` ➡️ **A propos**