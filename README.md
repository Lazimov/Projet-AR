# ⚡ ImmaTech AR+ — Assistant de Diagnostic Tableau Électrique

> Projet étudiant Bac+2 — Réalité Augmentée sur navigateur

---

## 🏢 Contexte client

**ImmaTech** est une startup spécialisée dans la formation professionnelle immersive. Elle conçoit des outils pédagogiques destinés aux techniciens et artisans pour les accompagner lors d'interventions complexes sur le terrain.

Dans le cadre d'un contrat de développement, ImmaTech a mandaté notre équipe pour créer une expérience de **réalité augmentée guidée** : un assistant virtuel qui superpose un tableau électrique 3D interactif au-dessus d'un marqueur physique, et guide pas à pas un technicien à travers une procédure de diagnostic complète.

L'objectif final est d'intégrer cet outil dans des formations de remise à niveau pour les électriciens intervenant sur des installations domestiques.

---

## 🎯 Concept

Le technicien imprime un **marqueur Hiro** et le pose sur son plan de travail. En pointant son smartphone vers le marqueur, il voit apparaître un **tableau électrique domestique en 3D** flottant au-dessus.

L'application le guide en **5 étapes ordonnées** pour diagnostiquer une panne simulée :

1. Inspecter le disjoncteur général
2. Tester l'interrupteur différentiel 30mA
3. Repérer le disjoncteur divisionnaire défectueux (Chambre 16A)
4. Tester le disjoncteur défectueux
5. Vérifier le peigne d'alimentation

Chaque interaction correcte rapporte des points. Les erreurs entraînent une pénalité. Le meilleur score est sauvegardé localement.

---

## 👥 Équipe

| Membre | Rôle | Responsabilités |
|---|---|---|
| **Yannis** | Lead AR & Tracking | Setup A-Frame + AR.js, configuration du marqueur Hiro, scène 3D, gestion des événements marker, intégration `main.js` |
| **Alexandre** | Logique métier & Interactions | 3 composants A-Frame (`clickable`, `testable`, `inspect`), machine à états des étapes (`steps.js`), logique de validation |
| **Mickael** | 3D & Animations | Modélisation du tableau électrique avec primitives A-Frame, toutes les animations (`animations.js`) : pulse, blink, rotation, fade |
| **Yaniss** | UI, Score & Documentation | Overlay HTML/CSS (`ui.css`), système de score et timer (`score.js`), localStorage, README et docs techniques |

---

## 🛠️ Stack technique

| Technologie | Version | Usage |
|---|---|---|
| **A-Frame** | 1.5.0 | Moteur 3D / WebXR, primitives 3D, composants |
| **AR.js** | 3.4.5 | Tracking de marqueur (Hiro), rendu AR sur caméra |
| **HTML5** | — | Structure de la page, overlay UI, modales |
| **CSS3** | — | Glassmorphism, variables CSS, responsive |
| **JavaScript** | ES6+ (vanilla) | Logique métier, animations, score |
| **localStorage** | API Web | Persistance du meilleur score |

> ❌ Aucun bundler, aucun npm, aucun framework JS. Code 100% statique.

---

## ✅ Fonctionnalités

- [x] Tracking de marqueur Hiro (preset AR.js natif)
- [x] Tableau électrique 3D modélisé avec primitives A-Frame
- [x] 7 composants interactables (disjoncteur général, différentiel, 4 divisionnaires, peigne)
- [x] **Interaction 1** — Tap → fiche technique HTML avec description et rôle
- [x] **Interaction 2** — Bouton "Tester" → blink cyan + résultat fonctionnel/défectueux
- [x] **Interaction 3** — Bouton "Inspecter" → rotation 360° + cercle de scan
- [x] Machine à états : 5 étapes ordonnées, une seule active à la fois
- [x] Pulse emissive cyan en boucle sur le composant de l'étape active
- [x] Animation d'apparition (scale 0→1) quand le marqueur est détecté
- [x] Flash rouge global en cas d'erreur
- [x] Système de score : +20 pts (test), +15 pts (inspect), -5 pts (erreur)
- [x] Timer chrono démarrant au premier tap
- [x] Compteur d'erreurs
- [x] Barre de progression segmentée (5 étapes)
- [x] Texte d'instruction mis à jour à chaque étape
- [x] Labels 3D flottants sur les composants
- [x] Modale écran de fin avec score, temps, erreurs
- [x] Meilleur score sauvegardé en localStorage
- [x] Bouton "Réinitialiser" (reset complet)
- [x] Interface responsive mobile portrait

---

## 📂 Structure du projet

```
immatech-ar/
├── index.html              ← Page principale : scène AR + UI overlay
├── css/
│   └── ui.css              ← Styles interface (variables, modales, responsive)
├── js/
│   ├── animations.js       ← Effets visuels : pulse, blink, rotation, flash
│   ├── score.js            ← Score, timer, erreurs, localStorage
│   ├── steps.js            ← Machine à états des 5 étapes
│   ├── interactions.js     ← 3 composants A-Frame + logique modale
│   └── main.js             ← Initialisation, événements marqueur
├── assets/
│   └── markers/
│       └── README.md       ← Lien vers le marqueur Hiro + conseils impression
├── docs/
│   ├── architecture.md     ← Schéma ASCII + flux de données + choix techniques
│   └── repartition.md      ← Tâches détaillées par membre
└── README.md               ← Ce fichier
```

---

## 🚀 Installation & Lancement

### Prérequis

- Un navigateur moderne (Chrome recommandé)
- Un serveur HTTP local (**obligatoire** — A-Frame ne fonctionne pas en `file://`)
- HTTPS obligatoire pour la caméra sur smartphone

### Étape 1 — Cloner le dépôt

```bash
git clone <url-du-repo>
cd immatech-ar
```

### Étape 2 — Lancer un serveur local

**Option A — Extension VS Code Live Server (recommandé)**
1. Installer l'extension "Live Server" dans VS Code
2. Clic droit sur `index.html` → "Open with Live Server"
3. Ouvrir `http://localhost:5500` dans Chrome

**Option B — Python**
```bash
python -m http.server 8000
# Ouvrir http://localhost:8000
```

**Option C — Node.js (npx)**
```bash
npx serve .
# Ouvrir l'URL affichée
```

### Étape 3 — Tester sur smartphone (HTTPS requis)

La caméra du téléphone nécessite une connexion HTTPS. Utiliser **ngrok** pour
exposer le serveur local en HTTPS :

```bash
# Installer ngrok (une seule fois)
npm install -g ngrok

# Dans un second terminal (laisser le serveur local tourner)
ngrok http 8000
```

Ngrok affiche une URL du type `https://xxxx.ngrok.io`. Ouvrir cette URL sur le
smartphone.

> **Alternative gratuite :** VS Code Live Server + tunnel Gitpod ou Codespaces.

---

## 📱 Comment tester

### 1. Préparer le marqueur

Imprimer le marqueur **Hiro** depuis :
```
https://github.com/AR-js-org/AR.js/blob/master/data/images/hiro.png
```

- Imprimer en noir et blanc, fond blanc mat
- Taille recommandée : **12–15 cm × 12–15 cm**
- S'assurer que la bordure noire est intacte

### 2. Lancer l'application

1. Ouvrir l'URL HTTPS dans Chrome sur le smartphone
2. Autoriser l'accès à la caméra
3. L'interface UI s'affiche au-dessus de la vue caméra

### 3. Commencer le diagnostic

1. Pointer la caméra vers le marqueur Hiro
2. Le tableau électrique 3D apparaît au-dessus du marqueur
3. Suivre les instructions affichées en bas de l'écran
4. Taper sur le composant indiqué (celui qui pulse en cyan)
5. Utiliser "Tester" ou "Inspecter" selon l'instruction
6. Valider les 5 étapes pour terminer le diagnostic

---

## 📊 Conformité aux consignes AR+

| Exigence | Couverture |
|---|---|
| A-Frame 1.5.0 via CDN | ✅ `https://aframe.io/releases/1.5.0/aframe.min.js` |
| AR.js compatible A-Frame 1.5 | ✅ AR.js 3.4.5 via jsDelivr |
| HTML5 / CSS3 / JS vanilla ES6+ | ✅ Aucun framework JS |
| Aucun build tool / npm install | ✅ Code 100% statique |
| Marqueur Hiro (preset AR.js) | ✅ `<a-marker preset="hiro">` |
| Tableau électrique 3D avec primitives | ✅ 7+ composants a-box + a-text |
| 3 interactions A-Frame distinctes | ✅ clickable, testable, inspect |
| Système d'étapes guidées (5 étapes) | ✅ Machine à états dans steps.js |
| Pulse emissive sur composant actif | ✅ animation__pulse en boucle |
| Système de score + barre progression | ✅ score.js + DOM update |
| Timer chrono | ✅ setInterval dans score.js |
| localStorage meilleur score | ✅ avec try/catch |
| Animations : blink, rotation, fadeIn | ✅ animations.js |
| Flash rouge d'erreur | ✅ CSS transition + class toggle |
| UI responsive mobile portrait | ✅ media query 480px |
| Commentaires en français | ✅ Tous les fichiers JS/CSS |
| Séparation stricte par fichier | ✅ 5 fichiers JS distincts |
| README complet en français | ✅ Ce fichier |
| Documentation technique | ✅ docs/architecture.md + repartition.md |

---

## 🔧 Problèmes courants

| Problème | Cause probable | Solution |
|---|---|---|
| "Accès à la caméra refusé" | URL en HTTP ou permission refusée | Utiliser ngrok (HTTPS) + autoriser dans les paramètres |
| Marqueur non détecté | Mauvais éclairage ou marqueur trop petit | Bien éclairer, imprimer à 15cm minimum |
| Tableau 3D absent | Marqueur hors cadre ou mal positionné | Pointer perpendiculairement, se rapprocher |
| Scène trop grande/petite | Scale inadapté à la taille du marqueur | Ajuster `scale` dans `index.html` (`#tableau-scene`) |
| "Cannot read dataset of null" | Script chargé avant le DOM | Vérifier l'ordre des `<script>` en fin de body |
| Console : "CORS error" | Serveur file:// au lieu d'HTTP | Obligatoirement utiliser un serveur HTTP |
| Mauvaise performance | Ancien smartphone ou navigateur | Utiliser Chrome mobile à jour, fermer les autres onglets |

---

## 📝 Licence

Projet académique — **IPSSI / ImmaTech** — Promotion 2024–2025

Usage pédagogique uniquement. Ne pas redistribuer sans accord de l'équipe projet.
