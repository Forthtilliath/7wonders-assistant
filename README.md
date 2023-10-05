# 7 Wonders: Assistant

<p style="font-size: larger">7 Wonders: Assistant est une application qui aide les utilisateurs à gérer et à calculer les scores de leurs parties de 7 Wonders.</p>

## Qu'est-ce 7 Wonders ?

### 7 Wonders, un jeu mythique
Dans 7 Wonders, vous êtes à la tête de l'une des sept grandes cités du monde antique. Votre but est de faire prospérer votre ville pour la rendre plus influente que celles de vos adversaires. Le futur des cités légendaires comme Babylone, Éphèse ou encore Rhodes dépend de vos talents de gestionnaire. Pour inscrire votre cité dans l'Histoire, vous devrez agir dans différents secteurs de développement. Exploitez les ressources naturelles de vos terres, participez aux progrès scientifiques, développez vos relations commerciales et affirmez votre suprématie militaire. Laissez votre empreinte dans l'histoire des civilisations en bâtissant une merveille monumentale. 

### 7 Wonders, un jeu de draft à travers 3 âges
Une partie se déroule à travers 3 âges successifs comportant chacun 6 tours de jeu. Chaque époque se joue de manière identique et repose sur un système de draft. Chaque joueur choisit une carte de sa main, la joue et passe les cartes restantes au joueur suivant. Ce principe de jeu permet aux différents paquets de cartes de tourner entre les joueurs qui ont donc 6 cartes pour développer au mieux leur stratégie. À chaque tour, les participants ont 3 actions possibles : construire leur cité, développer leur merveille ou gagner de l'argent.

### 7 Wonders, un jeu stratégique
Pour régner en maître, les joueurs devront établir une stratégie et composer avec leurs cartes pour dérouler leur plan d'actions sans encombre. Le jeu leur offre aussi la possibilité d'interagir avec les autres joueurs en bénéficiant de certains avantages tirés des cartes jouées. À la fin du 3ème âge, les joueurs devront compter leurs points de victoire. Le score final dépendra des bâtiments construits (commerciaux, civils et scientifiques), du stade de développement de leur merveille, des victoires militaires et des fortunes engrangées. 7 Wonders est un jeu stratégique où les joueurs ne doivent oublier aucun aspect du jeu pour triompher. La cité doit prospérer sur le plan civil, scientifique, commercial et militaire. Autrement dit, leur cité devra être belle, riche et puissante. Le joueur avec le score le plus élevé est déclaré vainqueur.

## Description de l'application

L'application permettra d'enregistrer le nom et un avatar pour chaque joueur. Il sera possible de mettre en favori un joueur afin de l'avoir par défaut dans une nouvelle partie. De plus, il sera possible de l'archiver, afin de le lister à la suite des autres joueurs.

Le but de l'application sera de pouvoir enregistrer les scores d'une partie réalisée. L'utilisateur pourra ajouter des joueurs parmis ceux créés, de noter leurs scores pour chaque catégorie de cartes, et enfin d'avoir un tableau de scores pour connaitre le score de chaque joueur.

L'application propose également une page de statistiques et une page d'historique. La page de statistiques présente des graphiques pour chaque joueur, affichant leur taux de victoire et leurs points dans chaque catégorie. De même, la page d'historique offre un résumé des parties précédentes, permettant de consulter les scores des parties passées.

## A propos de nous

Nous sommes 2 sur le projet.

|       |      |
| :---: | :--- |
| [![Avatar Forth](/src/assets/logo-forth.png)](https://github.com/Forthtilliath) | « Grand fan du jeu de société 7 Wonders, je fais beaucoup de parties en famille, ce qui implique que les carnets de scores sont complétés depuis un moment. J'avais fait un tableur permettant d'enregistrer les scores et générer un graphe simpliste affichant les points gagnés pour chaque catégorie de cartes de chaque joueur. Les applications disponibles ne me conviennent pas (soit pas à jour, soit pas pratique à utiliser, etc).<br/>Je joue aussi beaucoup à la version Duel pour laquelle j'ai trouvé une application super d'utilisation. C'est pourquoi, j'ai décider de faire une application similaire pour la version de base du jeu ! » |
|       |      |
| [![Avatar Mike_DreeMan](/src/assets/logo-mike.png)](https://github.com/mickaelrebeau) | « Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. » |

## Sur quels OS sera disponible l'application ?

L'application sera uniquement disponible sur Android. Nous avons pris cette décision en raison de certaines contraintes techniques. Pour construire une application pour iOS et la partager sur l'App Store, il est nécessaire de disposer d'un téléphone ou d'un ordinateur Apple, ce qui n'est pas le cas pour notre équipe de développement. Par conséquent, nous avons choisi de nous concentrer sur le développement de l'application pour Android.

## Y aura-il un back ?

Nous avons opté pour une approche simple et conviviale pour l'application. Notre objectif est de permettre aux utilisateurs de l'installer et de l'utiliser hors ligne, sans avoir besoin de se connecter. Les informations relatives aux joueurs et aux parties seront enregistrées localement sur le téléphone de l'utilisateur.

Par conséquent, nous n'aurons pas besoin de mettre en place un back-end pour utiliser une base de données. Cette approche permettra aux utilisateurs de profiter de l'application de manière autonome, sans dépendre d'une connexion Internet ou d'un serveur externe.

## Quelles technologies seront utilisées ?

En tant que développeurs React, nous avons choisi de développer une application mobile avec React couplé à Capacitor pour les raisons suivantes :

1. Connaissance et expérience en React : En tant que développeurs React, nous sommes déjà familiarisés avec la bibliothèque JavaScript React et son approche de développement d'interfaces utilisateur. Cela nous permet de capitaliser sur notre expertise existante et de développer l'application mobile en utilisant un langage que nous connaissons bien.
2. Développement multiplateforme : React permet de développer des applications mobiles multiplateformes, c'est-à-dire des applications qui peuvent être déployées à la fois sur Android et iOS. En utilisant React avec Capacitor, nous pouvons écrire un code unique qui peut être exécuté sur différentes plateformes mobiles, ce qui nous permet d'économiser du temps et des ressources en évitant de devoir développer et maintenir des applications distinctes pour chaque plateforme.
3. Capacitor pour l'accès natif : Capacitor est un framework open-source qui permet aux applications web de s'exécuter nativement sur les appareils mobiles. Il agit comme une couche d'abstraction entre notre code React et les fonctionnalités natives des appareils, telles que l'accès à la caméra, aux capteurs, aux notifications, etc. Capacitor facilite l'intégration de fonctionnalités natives dans notre application React, sans nécessiter de connaissances approfondies des langages natifs tels que Java, Kotlin ou Objective-C.
4. Écosystème React : En choisissant React pour le développement de notre application mobile, nous bénéficions également de l'ensemble de l'écosystème React, y compris de nombreuses bibliothèques et outils disponibles pour faciliter le développement, le test et le déploiement de notre application. Nous pouvons également tirer parti de la communauté active de développeurs React pour obtenir du support, des conseils et des ressources.
   
---

En tant que développeur React, nous avons choisi d'utiliser plusieurs packages pour développer notre application mobile. Voici une liste des packages que nous utiliserons, classés du plus pertinent pour l'application aux packages utilisés uniquement pour le développement :

1. React et Capacitor : Nous utiliserons React en combinaison avec Capacitor pour développer notre application mobile. React est une bibliothèque JavaScript populaire pour le développement d'interfaces utilisateur, tandis que Capacitor est un framework open-source qui permet aux applications web de s'exécuter nativement sur les appareils mobiles. Cette combinaison nous permettra de développer une application mobile multiplateforme en utilisant un code unique.

2. Tailwind CSS : Nous utiliserons Tailwind CSS pour gérer le style de notre application. Tailwind CSS est un framework CSS utilitaire qui permet de créer rapidement et facilement des interfaces utilisateur réactives. Il offre une approche basée sur les classes pour définir le style des éléments, ce qui facilite la personnalisation et la maintenance du code CSS.

3. React-icons : Nous utiliserons la bibliothèque React-icons pour ajouter des icônes à notre interface utilisateur. Cette bibliothèque offre une large gamme d'icônes prêtes à l'emploi, ce qui nous permettra d'ajouter facilement des icônes sans avoir à les concevoir nous-mêmes.

4. Cypress : Nous utiliserons Cypress pour les tests unitaires de notre application. Cypress est un outil de test end-to-end qui permet de tester notre application de manière automatisée. Il offre une syntaxe simple et expressive pour écrire des tests, ce qui facilite la création et la maintenance des tests unitaires.

5. React-i18next : Nous utiliserons la bibliothèque React-i18next pour gérer la gestion des langues dans notre application. Cette bibliothèque permet d'ajouter facilement la possibilité de modifier la langue de l'application, ce qui permettra aux utilisateurs de choisir la langue qui leur convient le mieux.

6. React-image-crop : Nous utiliserons la bibliothèque React-image-crop pour la gestion des images dans notre application. Cette bibliothèque offre des fonctionnalités avancées pour la manipulation et le recadrage des images.

7. TypeScript : Nous utiliserons TypeScript pour notre code. TypeScript est un sur-ensemble de JavaScript qui ajoute des fonctionnalités de typage statique au langage. Cela nous permettra de détecter et de corriger les erreurs de type dès la phase de développement, ce qui améliorera la qualité et la robustesse de notre code.

8. React-spring : Nous utiliserons la bibliothèque React-spring pour ajouter des animations à notre application. React-spring est une bibliothèque d'animation pour React qui permet d'ajouter des animations fluides et réactives à notre application. Elle offre une syntaxe simple et expressive pour définir des animations basées sur des ressorts physiques.

9. Prettier, ESLint et @trivago/prettier-plugin-sort-imports : Nous utiliserons Prettier et ESLint pour maintenir la cohérence et la lisibilité de notre code. Prettier est un formateur de code qui nous permettra de formater automatiquement notre code selon des règles prédéfinies, tandis qu'ESLint est un linter qui nous permettra de détecter et de corriger les erreurs de style et de syntaxe dans notre code. De plus, nous utiliserons le plugin @trivago/prettier-plugin-sort-imports pour trier automatiquement nos importations en fonction de certaines règles, ce qui améliorera la lisibilité et la maintenance de notre code.

10. Prettier-plugin-tailwindcss : Nous utiliserons le plugin Prettier-plugin-tailwindcss pour formater automatiquement le code CSS généré par Tailwind CSS. Ce plugin nous permettra de maintenir un style cohérent et lisible pour notre code CSS, en suivant les conventions de Tailwind CSS.

11. Husky : Nous utiliserons Husky pour automatiser certaines tâches de pré-validation avant chaque commit. Husky est un outil de gestion des hooks Git qui nous permettra d'exécuter des scripts personnalisés, tels que des tests ou des vérifications de style, avant de valider nos modifications. Cela garantira la qualité et la cohérence de notre code à chaque étape du processus de développement.
