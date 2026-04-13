# ImmaTech AR+ — Assistant de Maintenance Serveur

Projet réalisé dans le cadre du **Parcours AR+** pour le client **ImmaTech**, startup spécialisée dans la formation professionnelle qui nous mandate pour développer une expérience immersive destinée à guider des techniciens lors d'interventions complexes.

## Concept

Une application web en réalité augmentée qui guide un technicien pas à pas pour effectuer la **maintenance virtuelle d'un serveur informatique**. Le technicien scanne un marqueur, voit apparaître un serveur en 3D au-dessus, et doit démonter les composants dans le bon ordre (disques, alimentations, ventilateurs, RAM, CPU, carte mère) en gagnant des points à chaque étape validée.

## Stack technique

- **A-Frame** (framework WebXR)
- **AR.js** (tracking par marqueurs + plans)
- **HTML / CSS / JavaScript**
- Build **WebGL** (accessible depuis un navigateur mobile, sans installation)

## Équipe & Répartition du travail

Le projet est réalisé par une équipe de 4 étudiants avec une répartition claire des responsabilités :

### Yannis — Lead AR & Tracking
Responsable de la partie technique AR et de l'architecture de la scène 3D.
- Setup du projet A-Frame + AR.js
- Configuration du tracking par marqueurs
- Implémentation de la détection de plans
- Mise en place de la scène AR multi-objets
- Tests de stabilité sur différents appareils

### Alexandre — Logique métier & Interactions
Responsable des interactions utilisateur et de la machine à états du parcours.
- Développement des **3 interactions JavaScript distinctes** (tap, démontage, inspection)
- Création des components A-Frame personnalisés
- Gestion de l'ordre des étapes de maintenance
- Validation des actions du technicien

### Mickael — Scène 3D & Animations
Responsable de la modélisation des composants et des effets visuels.
- Création des composants 3D du serveur (alimentation, ventilateurs, RAM, CPU, etc.)
- Animations de mise en valeur (highlight, pulse)
- Animations de démontage (élévation, rotation, disparition)
- Effets visuels de feedback

### Yaniss — UI, Score & Documentation
Responsable de l'interface utilisateur, du système de score et de la documentation.
- Système de **score et barre de progression**
- Interface overlay (header, panneau d'instructions, boutons)
- Chronomètre et compteur d'étapes
- Identité visuelle et charte graphique
- Rédaction de la documentation technique

## Conformité aux consignes du Parcours AR+

| Exigence | Implémentation |
|----------|----------------|
| Application AR complète (marqueurs + plans) | ✔️ Tracking Hiro + détection de plans |
| Minimum 3 interactions distinctes | ✔️ Tap, démontage, inspection |
| Scène AR multi-objets avec animations | ✔️ Serveur complet avec plusieurs composants animés |
| Système de score / progression en AR | ✔️ Score temps réel + barre de progression + étapes |
| Documentation technique complète | ✔️ README + documentation d'architecture |
| Build Android/iOS ou WebGL | ✔️ WebGL (compatible mobile via navigateur) |

## Organisation

Le projet est développé sur la semaine avec des points de synchronisation quotidiens entre les 4 membres de l'équipe. Chacun travaille sur sa partie en autonomie, puis des phases d'intégration permettent de fusionner les contributions sur Git.

---

**Équipe** : Yannis, Alexandre, Mickael, Yaniss
**Formation** : IPSSI — Prépa Informatique & Développement
**Parcours** : AR+
**Client** : ImmaTech
