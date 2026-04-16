# Architecture du projet ImmaTech AR+

## Schéma ASCII — Flux de données entre les modules

```
┌─────────────────────────────────────────────────────────────────────┐
│                         index.html                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UI OVERLAY (HTML/CSS)                                        │  │
│  │  • Header : logo + score + timer                              │  │
│  │  • Barre de progression (5 segments)                          │  │
│  │  • Panneau d'instructions                                     │  │
│  │  • Modal fiche technique        ←── tap composant             │  │
│  │  • Modal écran de fin           ←── toutes étapes validées    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SCÈNE A-FRAME (WebGL via Three.js)                           │  │
│  │  ┌─────────────────────────────────────────────────────┐     │  │
│  │  │  <a-marker preset="hiro">                            │     │  │
│  │  │    <a-entity id="tableau-scene">                     │     │  │
│  │  │      boîtier + rails DIN + peigne                    │     │  │
│  │  │      disjoncteur général  ← clickable/testable/inspect│    │  │
│  │  │      interrupteur diff.   ← clickable/testable/inspect│    │  │
│  │  │      disjoncteur×4        ← clickable/testable/inspect│    │  │
│  │  │      bornier de terre (décoratif)                    │     │  │
│  │  │    </a-entity>                                       │     │  │
│  │  │  </a-marker>                                         │     │  │
│  │  └─────────────────────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

                              ↕ événements DOM

┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  animations.js │   │   score.js    │   │    steps.js   │
│               │   │               │   │               │
│ startPulse()  │   │ ajouterPoints │   │ ETAPES[0..4]  │
│ stopPulse()   │   │ retirerPoints │   │ getEtapeCour. │
│ playBlink()   │   │ ajouterErreur │   │ validerEtape  │
│ playInspect.  │   │ demarrerTimer │   │ demarrer()    │
│ sceneAppear() │   │ localStorage  │   │ reinitialiser │
│ flashErreur() │   │ afficherFin() │   │               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └──────────┬────────┘                   │
                   ↓                            ↓
          ┌────────────────┐          ┌──────────────────┐
          │ interactions.js │          │     main.js      │
          │                │          │                  │
          │ ouvrirModal()  │          │ markerFound →    │
          │ fermerModal()  │          │   sceneAppear()  │
          │ actionTester() │──────────→   steps.demarrer│
          │ actionInspecter│          │ markerLost → log │
          │                │          │                  │
          │ AFRAME.register│          │ reset depuis     │
          │  clickable-comp│          │ bouton HTML      │
          │  testable-comp │          └──────────────────┘
          │  inspect-comp  │
          └────────────────┘
```

## Flux d'un tap utilisateur

```
Tap sur composant 3D
        │
        ▼
clickable-component.init() → event 'click'
        │
        ▼
ImmaTechInteractions.ouvrirModal(el)
        │
        ├── ImmaTechScore.demarrerTimer()
        ├── Lire el.dataset.* (nom, description, rôle, défectueux)
        └── Afficher modal-fiche en DOM

Tap bouton "Tester"
        │
        ▼
ImmaTechInteractions.actionTester()
        │
        ├── ImmaTechAnimations.playBlink(el, callback)
        │         └── 3× couleur cyan ↔ origine (280ms chacun)
        │
        ├── Afficher résultat (fonctionnel / défectueux)
        │
        ├── if bonComposant && bonneAction:
        │       ImmaTechSteps.validerEtapeCourante()
        │           ├── stopPulse(compActuel)
        │           ├── indexCourant++
        │           ├── startPulse(nouveauComp)
        │           └── emit 'etape-validee'
        │       ImmaTechScore.ajouterPoints(points)
        │
        └── else:
                ImmaTechScore.ajouterErreur()
                    └── ImmaTechAnimations.flashErreur()
```

## Composants A-Frame enregistrés

| Nom | Fichier | Rôle |
|---|---|---|
| `clickable-component` | interactions.js | Écoute `click` (cursor raycaster) → ouvre la fiche technique |
| `testable-component` | interactions.js | Marque l'entité comme "testable" via `el.dataset.testable` |
| `inspect-component` | interactions.js | Marque l'entité comme "inspectable" via `el.dataset.inspectable` |

## Choix techniques

### Pourquoi A-Frame 1.5.0 + AR.js 3.4.5 ?
- A-Frame 1.5.0 est la version stable la plus récente, compatible avec AR.js 3.x
- AR.js 3.x supporte la détection de marqueurs NFT et templates (Hiro) sans dépendance serveur
- Les deux peuvent être chargés depuis CDN : aucun build tool nécessaire

### Pourquoi un namespace global `window.ImmaTech*` ?
- Pas de bundler ni d'ES modules natifs pour garder le code 100% statique
- Les modules IIFE (Immediately Invoked Function Expression) isolent les variables internes
- L'API publique exposée sur `window` permet la communication entre fichiers

### Pourquoi localStorage pour le meilleur score ?
- Solution simple et sans serveur pour la persistance légère
- API synchrone, sans promesse, accessible à des étudiants Bac+2
- Try/catch pour gérer le mode navigation privée (où localStorage est bloqué)

### Scale et proportions AR
- Le conteneur `#tableau-scene` utilise `scale="0.2 0.2 0.2"`
- Les composants internes sont dimensionnés en unités A-Frame (1 = 1m en théorie)
- La scène apparaît à `position="0 0.3 0"` au-dessus du marqueur
- Ajuster `scale` dans `index.html` ET la valeur cible `to: '0.2 0.2 0.2'` dans `animations.js:sceneAppear()` si nécessaire

### Pourquoi séparer les 3 interactions en composants distincts ?
- Respect de la consigne pédagogique (3 composants A-Frame distincts)
- `clickable-component` : couche de déclenchement (événement)
- `testable-component` et `inspect-component` : couche de capacité (métadonnée)
- La logique métier reste dans `ImmaTechInteractions` (séparation des responsabilités)
