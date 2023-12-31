- [x] Faire le menu
- [x] Faire le routage
- [x] Ajouter les headers de chaque page
- [x] Mettre le header dans le layout et récupérer le title dans les data
- [x] Modifier les contexts en stores
- [x] Remplacer framer-motion !
  - [ ] Back dans store pour inverser animation exit ?
- [x] Ajouter prettier/eslint
- [ ] Ajouter husky
- [x] Ajouter prettier sort
- [ ] Ajouter des errors boundary
- [x] Ajouter une icone pour l'app
- [ ] Ajouter une modal pour le delete joueur
- [x] Ajouter une bordure à l'icone Favorite
- [x] Les pages Settings, Feedback et About ont un bouton retour 
- [ ] Ajouter un gitaction pour les tests unitaires : https://docs.cypress.io/guides/continuous-integration/github-actions
- [ ] Supprimer un joueur ne le supprime pas vraiment
  - [ ] Ajouter un état (idem que favorite & archived)

- [ ] Possibilité d'enregistrer les données dans un fichier
  - [ ] des joueurs
  - [ ] des parties
- [ ] Possibilité de charger les données à partir d'un fichier

- [x] Ajouter hook pour header (pathname & label)
- [x] Générer router à partir de menu
- [x] Replacer framer-motion par react-spring : https://www.npmjs.com/package/react-spring
  - [x] Vérifier ``m`` de framer-motion : https://www.youtube.com/watch?v=gX4N44sPNHY (lazy motion)o
- [x] Afficher les joueurs par ordre alphabétique
- [x] Prendre en compte les écrans un peu plus large tel que les tablettes
- [ ] Possibilité du jeu en équipe
- [x] Check toutes les heights de page et scrolls
- [x] Quand on fait previous après la création de la partie, la partie est annulée
- [x] Quand on fait previous sur la création de la partie, on affiche une confirm box pour previous (ce qui supprime la partie)
- [x] Voir pour fixer le bouton next au changement de catégorie de score
- [x] Fixer width title en fonction des icones à droite
- [ ] Prendre en compte dans l'history si on ajoute des nouvelles extensions
- [ ] Constant des extensions en minuscules
- [ ] Voir pour charger les données du joueur dans editPlayer via le loader
- [ ] Voir pour charger les données des joueurs dans ListPlayer et NewGame via le loader

# TODO Next Session
- [x] Ajouter Traductions
- [ ] Ajouter Possibilité de Save/Load les data dans les options
- [x] Ajouter les premiers graphiques
- [ ] Ajouter de nouveaux TU pour vérifier chaque liens/pages
- [ ] Revoir la façon dont sont enregistrées les extensions dans la page
  - [ ] DB : Passer de 1 attribut par extension à un array d'extensions
  - [ ] LS : Passer d'un objet à un array d'extensions
  - [ ] Enregistrement de la partie
  - [ ] Affichage des tags de la partie
  - [ ] Affichage de la colonne d'extension
  - [ ] Score d'une extension off doit etre NULL

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
    - [x] Archiver le joueur
    - [x] Redirection vers `/players`
- [x] `/settings` ➡️ **Configurations**
- [x] `/feedback` ➡️ **Contacter le support**
- [x] `/rate` ➡️ **Noter l'application**
  - [ ] Rediriger vers l'application
- [x] `/about` ➡️ **A propos**