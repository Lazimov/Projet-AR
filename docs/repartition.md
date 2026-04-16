# Répartition des tâches — ImmaTech AR+

## Équipe projet

| Membre | Rôle | Fichiers principaux |
|---|---|---|
| **Yannis** | Lead AR & Tracking | `index.html` (scène A-Frame), `main.js` |
| **Alexandre** | Logique métier & Interactions | `interactions.js`, `steps.js` |
| **Mickael** | 3D & Animations | `animations.js`, modélisation dans `index.html` |
| **Yaniss** | UI, Score & Documentation | `score.js`, `ui.css`, `README.md`, `docs/` |

---

## Yannis — Lead AR & Tracking

**Responsabilité principale :** Mise en place de l'infrastructure AR (A-Frame + AR.js),
configuration du tracking de marqueur et organisation de la scène 3D.

### Sous-tâches détaillées

1. **Setup initial du projet**
   - Créer la structure de dossiers
   - Intégrer les CDN A-Frame 1.5.0 et AR.js 3.4.5 dans `index.html`
   - Configurer `<a-scene>` avec les attributs AR.js corrects (`embedded`, `arjs`, `renderer`)
   - Tester l'accès caméra en HTTP et HTTPS

2. **Configuration du marqueur Hiro**
   - Configurer `<a-marker preset="hiro">` comme ancre de la scène
   - Écouter les événements `markerFound` et `markerLost` dans `main.js`
   - Déclencher l'apparition de la scène à la première détection

3. **Scène 3D du tableau électrique**
   - Positionner le conteneur `#tableau-scene` (`position`, `scale`) au-dessus du marqueur
   - S'assurer que l'échelle est cohérente avec la taille d'impression du marqueur
   - Ajouter le cursor + raycaster sur la caméra pour les clics

4. **Intégration de main.js**
   - Attendre l'événement `loaded` de A-Frame avant toute initialisation
   - Gérer le flag `premierDetection` pour éviter un double-démarrage
   - Câbler la fermeture de modale en cliquant sur le fond

5. **Tests multi-plateforme**
   - Vérifier le fonctionnement sur Chrome Android (HTTPS via ngrok)
   - Vérifier le fallback desktop (souris + marqueur à l'écran)
   - Vérifier que le cursor détecte bien les entités `.interactable`

6. **Support HTTPS**
   - Documenter la procédure ngrok pour les tests sur smartphone
   - Tester que la caméra est accessible après permission navigateur

---

## Alexandre — Logique métier & Interactions

**Responsabilité principale :** Les 3 composants A-Frame d'interaction, la machine à
états des étapes et la logique de validation du diagnostic.

### Sous-tâches détaillées

1. **Composant `clickable-component`**
   - Enregistrer le composant avec `AFRAME.registerComponent()`
   - Écouter l'événement `click` (raycaster) sur l'entité
   - Appeler `ImmaTechInteractions.ouvrirModal(el)` au déclenchement
   - Ajouter un highlight subtle au `mouseenter` (desktop)

2. **Composant `testable-component`**
   - Enregistrer le composant
   - Marquer `el.dataset.testable = 'true'` pour accès externe

3. **Composant `inspect-component`**
   - Enregistrer le composant
   - Marquer `el.dataset.inspectable = 'true'` pour accès externe

4. **Module `ImmaTechInteractions`**
   - Implémenter `ouvrirModal(el)` : lecture des `data-*`, remplissage de la modale HTML
   - Implémenter `fermerModal()` : fermeture + masquage du label 3D
   - Implémenter `actionTester()` : blink + affichage résultat + validation étape
   - Implémenter `actionInspecter()` : déléguer à `playInspection` + validation étape
   - Gérer `_setButtonsDisabled()` pour éviter les doubles actions

5. **Machine à états `steps.js`**
   - Définir le tableau `ETAPES` avec les 5 définitions d'étapes
   - Implémenter `validerEtapeCourante()` : stopPulse + indexCourant++ + startPulse suivant
   - Implémenter `demarrer()` et `reinitialiser()`
   - Émettre l'événement DOM `'etape-validee'` avec les détails

6. **Règles de validation**
   - S'assurer que seule la combinaison (bon composant × bonne action) valide une étape
   - Appliquer la pénalité `-5 pts` pour tout test sur le mauvais composant
   - Ne pas pénaliser l'inspection d'un composant hors étape (exploration libre)

---

## Mickael — 3D & Animations

**Responsabilité principale :** Modélisation 3D du tableau électrique avec les
primitives A-Frame, et tous les effets visuels/animations.

### Sous-tâches détaillées

1. **Modélisation du tableau électrique**
   - Boîtier blanc cassé (4×3×0.3) + cadre intérieur
   - Rails DIN (2 rangées) avec détail d'encoche
   - Disjoncteur général : corps rouge foncé + levier ON + voyant + étiquette
   - Interrupteur différentiel : corps vert + levier + bouton TEST jaune + étiquette
   - 4 disjoncteurs divisionnaires : corps bleu + levier (vert/rouge) + étiquette circuit
   - Peigne d'alimentation : barre ocre fine
   - Bornier de terre : vert/jaune + fil décoratif
   - Câblage d'entrée décoratif (fils rouge/bleu/vert)

2. **Labels 3D flottants**
   - Créer un `<a-text>` par composant interactable (`visible="false"` par défaut)
   - Positionner chaque label au-dessus de son composant
   - Afficher/masquer depuis `ImmaTechInteractions.ouvrirModal` / `fermerModal`

3. **Animation `startPulse` / `stopPulse`**
   - `animation__pulse` : oscille `material.emissive` entre `#000000` et `#06b6d4`
   - `animation__pulseIntensity` : oscille `emissiveIntensity` entre 0 et 0.65
   - Les deux en boucle infinie synchronisée (durée 850ms, easeInOutSine)

4. **Animation `playBlink`**
   - 3 clignotements : alternance couleur cyan ↔ couleur d'origine
   - Durée d'un demi-cycle : 280ms (→ durée totale ≈ 1.7s)
   - Callback appelé quand l'animation est terminée

5. **Animation `playInspection`**
   - Rotation `0 0 0` → `0 360 0` en 2000ms (easeInOutQuad)
   - Cercle CSS de scan : keyframe `cercleScan` injecté dynamiquement
   - `removeAttribute('animation__inspection')` + reset rotation dans le callback

6. **Animation `sceneAppear`**
   - Scale `0 0 0` → `0.2 0.2 0.2` en 500ms avec `easeOutBack` (rebond léger)
   - Suppression de l'attribut `animation__appear` après 650ms

---

## Yaniss — UI, Score & Documentation

**Responsabilité principale :** Interface utilisateur overlay, système de score,
persistance localStorage, et toute la documentation écrite du projet.

### Sous-tâches détaillées

1. **CSS `ui.css`**
   - Définir toutes les variables CSS (couleurs, rayons, ombres, transitions)
   - Composer le header (logo gradient + score + timer)
   - Composer la barre de progression (5 points + connecteurs, états active/completed)
   - Composer le panneau d'instructions (bas de l'écran, glassmorphism)
   - Composer les modales (fiche technique + écran de fin)
   - Rendre le tout responsive (breakpoint 480px)

2. **Module `ImmaTechScore`**
   - Implémenter `ajouterPoints` / `retirerPoints` (plancher à 0)
   - Implémenter `ajouterErreur` (erreurs++ + pénalité + flash rouge)
   - Implémenter `demarrerTimer` / `stopperTimer` (setInterval, idempotent)
   - Implémenter `getTempsFormate()` en mm:ss
   - Implémenter `getMeilleurScore` / `sauvegarderMeilleurScore` (localStorage + try/catch)
   - Implémenter `afficherEcranFin` (remplit et affiche `modal-fin`)
   - Implémenter `reset` (remet tout à zéro + relance `steps.demarrer()`)

3. **HTML overlay dans `index.html`**
   - Header avec `id="score-value"` et `id="timer-value"`
   - Barre de progression avec `data-step="1"` … `data-step="5"`
   - Panneau avec `id="instruction-text"` et `id="step-counter"`
   - Modal fiche technique (tous les `id` ciblés par interactions.js)
   - Modal écran de fin (`id="fin-score"`, `id="fin-temps"`, etc.)

4. **Flash d'erreur CSS**
   - `#error-flash` avec transition CSS sur `opacity`
   - Ajout/suppression de la classe `.visible` via JS

5. **README.md**
   - Rédiger les 12 sections requises (contexte, équipe, stack, install, etc.)
   - Tableau de conformité aux consignes AR+
   - Section dépannage

6. **Documentation technique**
   - `docs/architecture.md` : schéma ASCII + flux + choix techniques
   - `docs/repartition.md` (ce fichier) : détail des tâches par membre
   - `assets/markers/README.md` : guide d'impression et de détection du marqueur
