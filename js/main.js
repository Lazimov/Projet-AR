/**
 * main.js — Point d'entrée et initialisation de l'application
 * Auteur : Yannis
 *
 * Responsabilités :
 *  - Attendre que A-Frame soit prêt
 *  - Écouter les événements du marqueur Hiro (détecté / perdu)
 *  - Câbler les interactions globales (fermeture modale sur fond, etc.)
 *  - Démarrer la machine à états au premier chargement
 *  - Gérer le raycasting manuel (THREE.js) pour des hitbox stables
 *
 * RAYCASTING MANUEL — Pourquoi ?
 *   Le cursor A-Frame avec raycaster="recursive: false" ne peut pas
 *   intersecter les entités A-Frame car leur object3D est un THREE.Group
 *   sans géométrie. Avec recursive: true, les enfants décoratifs absorbent
 *   les clics avant le composant parent.
 *   Solution : raycasting THREE.js direct sur les mesh (getObject3D('mesh'))
 *   avec updateMatrixWorld(true) forcé avant chaque test pour éviter les
 *   matrices périmées après perte/reprise du marqueur.
 *
 * NOTE SCALE :
 *   Le conteneur #tableau-scene utilise scale="0.2 0.2 0.2".
 *   Si le tableau paraît trop grand ou trop petit selon la taille
 *   d'impression du marqueur Hiro, ajuster cette valeur ici
 *   ET dans la fonction sceneAppear() de animations.js.
 */

document.addEventListener('DOMContentLoaded', function () {

  console.log('[ImmaTech AR+] Initialisation de l\'application...');
  console.log('[ImmaTech AR+] Meilleur score enregistré :', ImmaTechScore.getMeilleurScore());

  // Récupérer la scène A-Frame
  var scene = document.querySelector('a-scene');

  if (!scene) {
    console.error('[ImmaTech AR+] Erreur : aucune a-scene trouvée dans le DOM.');
    return;
  }

  /* ----------------------------------------------------------------
     ATTENDRE QUE A-FRAME SOIT PRÊT
  ---------------------------------------------------------------- */
  if (scene.hasLoaded) {
    _init();
  } else {
    scene.addEventListener('loaded', function () {
      console.log('[ImmaTech AR+] Scène A-Frame chargée.');
      _init();
    });
  }

  /* ----------------------------------------------------------------
     INITIALISATION PRINCIPALE
  ---------------------------------------------------------------- */

  function _init() {

    // Écouter les événements du marqueur Hiro
    var marker = document.getElementById('hiro-marker');
    if (marker) {
      marker.addEventListener('markerFound', _surMarqueurDetecte);
      marker.addEventListener('markerLost',  _surMarqueurPerdu);
    } else {
      console.warn('[ImmaTech AR+] Marqueur #hiro-marker introuvable.');
    }

    // Fermer la modale fiche en cliquant sur l'arrière-plan
    var modalFiche = document.getElementById('modal-fiche');
    if (modalFiche) {
      modalFiche.addEventListener('click', function (e) {
        if (e.target === modalFiche) {
          ImmaTechInteractions.fermerModal();
        }
      });
    }

    // Écouter l'événement de validation d'étape pour les logs
    document.addEventListener('etape-validee', function (e) {
      console.log(
        '[ImmaTech AR+] Étape validée — points :', e.detail.points,
        '| score total :', ImmaTechScore.getScore()
      );
    });

    // Initialiser la barre de progression et afficher le message d'attente
    ImmaTechSteps.reinitialiser();

    // Brancher le raycasting manuel sur le canvas A-Frame
    _brancherRaycastingManuel();

    console.log('[ImmaTech AR+] Prêt — pointez la caméra vers le marqueur Hiro.');
  }

  /* ----------------------------------------------------------------
     ÉVÉNEMENT — MARQUEUR DÉTECTÉ
  ---------------------------------------------------------------- */

  var premierDetection = true;

  function _surMarqueurDetecte() {
    console.log('[ImmaTech AR+] Marqueur Hiro détecté !');

    var tableauScene = document.getElementById('tableau-scene');

    // Forcer la mise à jour des matrices dès la (re-)détection
    if (scene.object3D) {
      scene.object3D.updateMatrixWorld(true);
    }

    if (premierDetection) {
      premierDetection = false;

      if (tableauScene) {
        ImmaTechAnimations.sceneAppear(tableauScene);
      }

      setTimeout(function () {
        ImmaTechSteps.demarrer();
      }, 300);

    } else {
      if (tableauScene) {
        tableauScene.setAttribute('scale', '0.2 0.2 0.2');
      }
    }
  }

  /* ----------------------------------------------------------------
     ÉVÉNEMENT — MARQUEUR PERDU
  ---------------------------------------------------------------- */

  function _surMarqueurPerdu() {
    console.log('[ImmaTech AR+] Marqueur perdu — réorientez la caméra.');
    // AR.js cache automatiquement le contenu du marqueur.
    // On ne touche pas au timer : le diagnostic continue.
  }

  /* ----------------------------------------------------------------
     RAYCASTING MANUEL — hitbox stables via THREE.js
  ---------------------------------------------------------------- */

  /**
   * Branche les écouteurs touchend et click sur le canvas AR.
   * Le canvas est créé par A-Frame/AR.js lors du chargement de la scène.
   */
  function _brancherRaycastingManuel() {
    var canvas = scene.canvas;
    if (!canvas) {
      console.warn('[ImmaTech AR+] Canvas introuvable — raycasting désactivé.');
      return;
    }

    // Mobile : touchend (passive pour la perf)
    canvas.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      if (t) _tester(t.clientX, t.clientY);
    }, { passive: true });

    // Desktop : click (souris / simulateur)
    canvas.addEventListener('click', function (e) {
      _tester(e.clientX, e.clientY);
    });
  }

  // Instances THREE.js réutilisées (évite les allocations par frame)
  var _raycaster = new THREE.Raycaster();
  var _ndc       = new THREE.Vector2();

  /**
   * Lance un rayon depuis les coordonnées écran (cx, cy) et ouvre la modal
   * du premier composant interactable touché.
   *
   * Principes :
   *  1. Ignorer si la modal est déjà ouverte (évite un double déclenchement)
   *  2. Forcer updateMatrixWorld(true) pour que les matrices soient à jour
   *     même au premier frame après une re-détection du marqueur
   *  3. Raycaster sur les mesh THREE.js directement (getObject3D('mesh')),
   *     avec recursive: false — on cible exactement la BoxGeometry, sans
   *     risque d'intersections parasites sur des enfants décoratifs
   *
   * @param {number} cx  Coordonnée X écran (pixels)
   * @param {number} cy  Coordonnée Y écran (pixels)
   */
  function _tester(cx, cy) {
    // Ne pas ouvrir une seconde modal si une est déjà affichée
    var modalFiche = document.getElementById('modal-fiche');
    if (modalFiche && modalFiche.style.display !== 'none') return;

    var camera = scene.camera;
    if (!camera) return;

    // --- Étape 1 : mettre à jour TOUTES les matrices de la scène ---
    // C'est le correctif anti-dérive après perte/reprise du marqueur.
    // Sans ça, les matrices des composants réflètent l'ancienne position
    // du marqueur et les hitbox dérivent à chaque re-détection.
    scene.object3D.updateMatrixWorld(true);

    // --- Étape 2 : convertir les pixels en NDC (-1..+1) ---
    _ndc.x =  (cx / window.innerWidth)  * 2 - 1;
    _ndc.y = -(cy / window.innerHeight) * 2 + 1;
    _raycaster.setFromCamera(_ndc, camera);

    // --- Étape 3 : collecter uniquement les mesh des .interactable ---
    // On travaille sur les mesh THREE.js (BoxGeometry) et non sur les
    // entités A-Frame (Group sans géométrie). Cela garantit que le rayon
    // intersecte exactement la zone visuelle de chaque composant.
    var meshes  = [];
    var entites = [];
    document.querySelectorAll('.interactable').forEach(function (el) {
      var mesh = el.getObject3D('mesh');
      if (mesh) {
        meshes.push(mesh);
        entites.push(el);
      }
    });

    if (meshes.length === 0) return; // scène pas encore prête

    // --- Étape 4 : intersecter --- recursive: false car on passe déjà
    // les mesh directement (pas besoin de descendre dans leurs enfants)
    var hits = _raycaster.intersectObjects(meshes, false);

    if (hits.length > 0) {
      var idx = meshes.indexOf(hits[0].object);
      if (idx >= 0) {
        ImmaTechInteractions.ouvrirModal(entites[idx]);
      }
    }
  }

});
