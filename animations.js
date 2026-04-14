/**
 * animations.js — Effets visuels et animations
 * Auteur : Mickael
 *
 * Corrections v2 :
 *  - Pulse remplacé par un composant A-Frame tick-based (plus de setAttribute
 *    en boucle qui recréait le matériau et cassait la référence du raycaster)
 *  - playInspection : tourne le groupe parent (data-type="groupe-composant")
 *    pour inclure les détails décoratifs dans la rotation
 *  - Cercle scan : z-index monté à 500 (visible au-dessus de la modal à 300)
 *  - reinitialiserComposants : remet aussi à zéro la rotation des groupes parents
 */

/* ================================================================
   COMPOSANT A-FRAME — pulse-actif
   Approche tick (direct Three.js) au lieu d'animation__pulse.
   Raison : setAttribute('material.emissive', ...) en boucle peut
   recréer le matériau, brisant la référence mesh du raycaster et
   rendant le composant impossible à cliquer pendant le pulse.
   ================================================================ */
AFRAME.registerComponent('pulse-actif', {

  init: function () {
    this._t = 0;
  },

  tick: function (time) {
    var mesh = this.el.getObject3D('mesh');
    if (!mesh || !mesh.material) return;

    // Sinusoïde : 0 → 1 → 0 avec une période d'environ 1.7 s
    var intensite = (Math.sin(time * 0.00370) + 1) / 2; // 2π / 1700ms ≈ 0.0037

    // Modifier directement le matériau Three.js (sans setAttribute)
    mesh.material.emissive.setHex(0x06b6d4);  // cyan
    mesh.material.emissiveIntensity = intensite * 0.75;
  },

  remove: function () {
    // Réinitialiser l'émissive quand le composant est retiré
    var mesh = this.el.getObject3D('mesh');
    if (mesh && mesh.material) {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
    }
  }

});

/* ================================================================
   MODULE ImmaTechAnimations
   ================================================================ */

window.ImmaTechAnimations = (function () {

  var DUREE_BLINK = 280;  // durée d'un demi-blink (ms)
  var NB_BLINKS   = 3;    // nombre de clignotements lors d'un test

  /* ----------------------------------------------------------------
     PULSE — via composant tick-based (fiable pour le raycaster)
  ---------------------------------------------------------------- */

  /**
   * Active le pulse emissive cyan sur un composant.
   * Utilise le composant A-Frame 'pulse-actif' enregistré ci-dessus.
   * @param {Element} el  Entité A-Frame (l'a-box interactable)
   */
  function startPulse(el) {
    if (!el) return;
    // S'assurer qu'un pulse précédent est bien arrêté
    if (el.components && el.components['pulse-actif']) {
      el.removeAttribute('pulse-actif');
    }
    el.setAttribute('pulse-actif', '');
  }

  /**
   * Désactive le pulse et remet l'émissive à zéro.
   * @param {Element} el  Entité A-Frame
   */
  function stopPulse(el) {
    if (!el) return;
    if (el.components && el.components['pulse-actif']) {
      el.removeAttribute('pulse-actif');
    }
    // Sécurité : forcer la remise à zéro via Three.js aussi
    var mesh = el.getObject3D ? el.getObject3D('mesh') : null;
    if (mesh && mesh.material) {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
    }
  }

  /* ----------------------------------------------------------------
     BLINK — animation de test (3 clignotements cyan)
  ---------------------------------------------------------------- */

  /**
   * Fait clignoter un composant 3 fois en cyan pour simuler un test.
   * @param {Element}  el        Entité A-Frame
   * @param {Function} callback  Appelé quand l'animation est finie
   */
  function playBlink(el, callback) {
    if (!el) {
      if (callback) callback();
      return;
    }

    var count       = 0;
    var couleurOrig = el.getAttribute('color') || '#ffffff';

    function unBlink() {
      if (count >= NB_BLINKS) {
        el.setAttribute('color', couleurOrig);
        // Remettre l'émissive via Three.js directement
        var mesh = el.getObject3D('mesh');
        if (mesh && mesh.material) {
          mesh.material.emissive.setHex(0x000000);
          mesh.material.emissiveIntensity = 0;
        }
        if (callback) callback();
        return;
      }

      // Phase ON : cyan
      el.setAttribute('color', '#06b6d4');
      var meshOn = el.getObject3D('mesh');
      if (meshOn && meshOn.material) {
        meshOn.material.emissive.setHex(0x06b6d4);
        meshOn.material.emissiveIntensity = 0.8;
      }

      setTimeout(function () {
        // Phase OFF : couleur d'origine
        el.setAttribute('color', couleurOrig);
        var meshOff = el.getObject3D('mesh');
        if (meshOff && meshOff.material) {
          meshOff.material.emissive.setHex(0x000000);
          meshOff.material.emissiveIntensity = 0;
        }

        setTimeout(function () {
          count++;
          unBlink();
        }, DUREE_BLINK);
      }, DUREE_BLINK);
    }

    unBlink();
  }

  /* ----------------------------------------------------------------
     INSPECTION — rotation 360° sur 2 secondes
  ---------------------------------------------------------------- */

  /**
   * Fait pivoter le composant (et ses détails décoratifs) à 360°.
   * Tourne le groupe parent (data-type="groupe-composant") si présent,
   * sinon tourne el lui-même.
   * La modal DOIT être fermée avant d'appeler cette fonction.
   * @param {Element}  el        Entité A-Frame interactable
   * @param {Function} callback  Appelé quand l'animation est finie
   */
  function playInspection(el, callback) {
    if (!el) {
      if (callback) callback();
      return;
    }

    // Trouver le groupe parent pour inclure les détails décoratifs
    var targetEl = el;
    if (el.parentNode
        && el.parentNode.dataset
        && el.parentNode.dataset.type === 'groupe-composant') {
      targetEl = el.parentNode;
    }

    // Remettre la rotation à zéro avant de lancer l'animation
    targetEl.setAttribute('rotation', '0 0 0');

    // Rotation 360° sur Y en 2 secondes
    targetEl.setAttribute('animation__inspection', {
      property : 'rotation',
      from     : '0 0 0',
      to       : '0 360 0',
      dur      : 2000,
      easing   : 'easeInOutQuad'
    });

    // Cercle de scan visible au-dessus de toute l'interface
    _afficherCercleScan();

    // Nettoyer après la fin de l'animation
    setTimeout(function () {
      targetEl.removeAttribute('animation__inspection');
      targetEl.setAttribute('rotation', '0 0 0');
      if (callback) callback();
    }, 2100);
  }

  /* ----------------------------------------------------------------
     APPARITION DE LA SCÈNE — scale 0 → 0.2 en 500ms
     La rotation (-90 0 0) est déjà définie en HTML et est préservée
     car on n'anime que la propriété 'scale'.
  ---------------------------------------------------------------- */

  /**
   * Anime l'apparition de la scène quand le marqueur est détecté.
   * @param {Element} el  L'entité #tableau-scene
   */
  function sceneAppear(el) {
    if (!el) return;

    el.setAttribute('scale', '0 0 0');

    el.setAttribute('animation__appear', {
      property : 'scale',
      from     : '0 0 0',
      to       : '0.2 0.2 0.2',
      dur      : 500,
      easing   : 'easeOutBack'
    });

    setTimeout(function () {
      el.removeAttribute('animation__appear');
    }, 650);
  }

  /* ----------------------------------------------------------------
     FLASH ROUGE — feedback d'erreur global
  ---------------------------------------------------------------- */

  /**
   * Superposition rouge brève sur tout l'écran.
   */
  function flashErreur() {
    var flash = document.getElementById('error-flash');
    if (!flash) return;
    flash.classList.add('visible');
    setTimeout(function () {
      flash.classList.remove('visible');
    }, 320);
  }

  /* ----------------------------------------------------------------
     RÉINITIALISATION — remet tous les composants à leur état initial
  ---------------------------------------------------------------- */

  /**
   * Remet à zéro toutes les animations, couleurs et rotations.
   * Inclut les groupes parents (animation d'inspection).
   */
  function reinitialiserComposants() {
    var composants = document.querySelectorAll('.interactable');

    composants.forEach(function (el) {
      // Désactiver le pulse (composant tick)
      stopPulse(el);

      // Supprimer les animations en cours sur l'élément lui-même
      el.removeAttribute('animation__inspection');
      el.setAttribute('rotation', '0 0 0');

      // Réinitialiser aussi le groupe parent si c'est un groupe-composant
      var group = el.parentNode;
      if (group && group.dataset && group.dataset.type === 'groupe-composant') {
        group.removeAttribute('animation__inspection');
        group.setAttribute('rotation', '0 0 0');
      }

      // Restaurer la couleur d'origine depuis le dataset
      var couleurOrig = el.dataset.couleurOrigine;
      if (couleurOrig) {
        el.setAttribute('color', couleurOrig);
      }

      // Cacher les labels 3D flottants
      var labelId = 'label-' + el.id.replace('comp-', '');
      var label   = document.getElementById(labelId);
      if (label) {
        label.setAttribute('visible', false);
      }
    });
  }

  /* ----------------------------------------------------------------
     UTILITAIRE PRIVÉ — cercle de scan CSS
  ---------------------------------------------------------------- */

  /**
   * Cercle cyan animé centré à l'écran (z-index 500, au-dessus de la modal).
   */
  function _afficherCercleScan() {
    if (!document.getElementById('style-cercle-scan')) {
      var style         = document.createElement('style');
      style.id          = 'style-cercle-scan';
      style.textContent = [
        '@keyframes cercleScan {',
        '  0%   { opacity: 1; transform: translate(-50%,-50%) scale(0.3); }',
        '  55%  { opacity: 0.85; transform: translate(-50%,-50%) scale(1.15); }',
        '  100% { opacity: 0; transform: translate(-50%,-50%) scale(2.0); }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }

    var cercle           = document.createElement('div');
    cercle.style.cssText = [
      'position:fixed',
      'top:50%',
      'left:50%',
      'width:140px',
      'height:140px',
      'border-radius:50%',
      'border:3px solid #06b6d4',
      'box-shadow:0 0 28px #06b6d4, inset 0 0 16px rgba(6,182,212,0.25)',
      'pointer-events:none',
      'z-index:500',           // au-dessus de la modal (z-index 300)
      'animation:cercleScan 2s ease-out forwards'
    ].join(';');

    document.body.appendChild(cercle);

    setTimeout(function () {
      if (cercle.parentNode) cercle.parentNode.removeChild(cercle);
    }, 2050);
  }

  /* ----------------------------------------------------------------
     API PUBLIQUE
  ---------------------------------------------------------------- */
  return {
    startPulse             : startPulse,
    stopPulse              : stopPulse,
    playBlink              : playBlink,
    playInspection         : playInspection,
    sceneAppear            : sceneAppear,
    flashErreur            : flashErreur,
    reinitialiserComposants: reinitialiserComposants
  };

})();
