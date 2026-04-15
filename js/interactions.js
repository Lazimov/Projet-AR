/**
 * interactions.js — Composants A-Frame et logique d'interaction
 * Auteur : Alexandre
 *
 * Corrections v2 :
 *  - clickable-component : les composants interactables n'ont plus
 *    d'enfants dans le HTML (voir index.html v2), donc le raycaster
 *    ne peut plus intercepter un enfant avant le parent.
 *  - mouseenter/leave : ne réinitialise pas l'émissive si pulse-actif
 *    est en cours (sinon le highlight écrase le pulse).
 *  - actionInspecter : ferme la modal AVANT l'animation pour que
 *    l'utilisateur voie la rotation 3D. Affiche un toast de résultat.
 *  - actionTester : inchangé (modal ouverte pour afficher le résultat).
 */

/* ================================================================
   MODULE ImmaTechInteractions
   ================================================================ */

window.ImmaTechInteractions = (function () {

  // Référence à l'entité A-Frame actuellement sélectionnée
  var composantCourant = null;

  /* ----------------------------------------------------------------
     OUVERTURE / FERMETURE MODALE FICHE TECHNIQUE
  ---------------------------------------------------------------- */

  /**
   * Ouvre la fiche technique pour le composant tapé.
   * Démarre le timer au premier tap.
   * @param {Element} el  Entité A-Frame (a-box interactable)
   */
  function ouvrirModal(el) {
    composantCourant = el;

    // Démarrer le chronomètre au premier tap
    ImmaTechScore.demarrerTimer();

    var nom         = el.dataset.nom         || 'Composant inconnu';
    var description = el.dataset.description || '';
    var role        = el.dataset.role        || '';
    var defectueux  = el.dataset.defectueux  === 'true';

    document.getElementById('modal-titre').textContent       = nom;
    document.getElementById('modal-description').textContent = description;
    document.getElementById('modal-role').textContent        = role;

    // Badge état
    var badge = document.getElementById('modal-badge');
    if (defectueux) {
      badge.textContent = '⚠ Défectueux';
      badge.className   = 'modal-badge defectueux';
    } else {
      badge.textContent = '✓ Normal';
      badge.className   = 'modal-badge';
    }

    // Réinitialiser la zone résultat
    var resultat           = document.getElementById('modal-resultat');
    resultat.style.display = 'none';
    resultat.className     = 'modal-resultat';
    resultat.textContent   = '';

    // Afficher le label 3D flottant
    var labelId = 'label-' + el.id.replace('comp-', '');
    var label   = document.getElementById(labelId);
    if (label) label.setAttribute('visible', true);

    // Réactiver les boutons (au cas où ils étaient désactivés)
    _setButtonsDisabled(false);

    document.getElementById('modal-fiche').style.display = 'flex';
  }

  /**
   * Ferme la fiche technique et masque le label 3D.
   */
  function fermerModal() {
    document.getElementById('modal-fiche').style.display = 'none';

    if (composantCourant) {
      var labelId = 'label-' + composantCourant.id.replace('comp-', '');
      var label   = document.getElementById(labelId);
      if (label) label.setAttribute('visible', false);
    }

    composantCourant = null;
  }

  /* ----------------------------------------------------------------
     ACTION TESTER — blink cyan + résultat dans la modal
  ---------------------------------------------------------------- */

  /**
   * Lance l'animation de test et affiche le résultat dans la modal ouverte.
   */
  function actionTester() {
    if (!composantCourant) return;

    var el            = composantCourant;
    var etapeCourante = ImmaTechSteps.getEtapeCourante();
    var defectueux    = el.dataset.defectueux === 'true';

    _setButtonsDisabled(true);

    // Animation de blink (3 clignotements cyan)
    ImmaTechAnimations.playBlink(el, function () {

      // Afficher le résultat dans la modal
      var resultat = document.getElementById('modal-resultat');
      if (defectueux) {
        resultat.textContent = '⚠️ Défectueux — Disjoncteur déclenché, circuit ouvert';
        resultat.className   = 'modal-resultat defectueux';
      } else {
        resultat.textContent = '✅ Fonctionnel — Composant opérationnel';
        resultat.className   = 'modal-resultat fonctionnel';
      }
      resultat.style.display = 'block';

      // Vérifier si bonne action sur bon composant
      var bonComposant = etapeCourante && el.id === etapeCourante.composantId;
      var bonneAction  = etapeCourante && etapeCourante.action === 'test';

      if (bonComposant && bonneAction) {
        var points = ImmaTechSteps.validerEtapeCourante();
        ImmaTechScore.ajouterPoints(points);

        if (ImmaTechSteps.estTermine()) {
          setTimeout(function () {
            fermerModal();
            ImmaTechScore.afficherEcranFin();
          }, 1600);
          return; // Ne pas réactiver les boutons (la modal va se fermer)
        }
      } else {
        ImmaTechScore.ajouterErreur();
      }

      _setButtonsDisabled(false);
    });
  }

  /* ----------------------------------------------------------------
     ACTION INSPECTER — ferme la modal, joue la rotation, toast résultat
  ---------------------------------------------------------------- */

  /**
   * Ferme la modal pour libérer la vue, puis joue l'animation de rotation 360°.
   * Affiche un toast de résultat (+points) après l'animation.
   * La modal n'est PAS rouverte : le toast suffit comme feedback.
   */
  function actionInspecter() {
    if (!composantCourant) return;

    var el            = composantCourant;
    var etapeCourante = ImmaTechSteps.getEtapeCourante();

    // FERMER la modal avant l'animation pour que l'utilisateur voie la rotation 3D
    fermerModal();

    // Lancer la rotation 360° + cercle de scan
    ImmaTechAnimations.playInspection(el, function () {

      // Points de base pour toute inspection
      ImmaTechScore.ajouterPoints(5);

      var bonComposant = etapeCourante && el.id === etapeCourante.composantId;
      var bonneAction  = etapeCourante && etapeCourante.action === 'inspect';

      if (bonComposant && bonneAction) {
        // Étape validée
        var points = ImmaTechSteps.validerEtapeCourante();
        ImmaTechScore.ajouterPoints(points);
        _afficherToast('✅ Inspecté ! +' + (5 + points) + ' pts');

        if (ImmaTechSteps.estTermine()) {
          setTimeout(function () {
            ImmaTechScore.afficherEcranFin();
          }, 1200);
        }
      } else {
        // Inspection hors-étape : petits points mais pas de pénalité
        _afficherToast('🔍 Inspecté ! +5 pts');
      }
    });
  }

  /* ----------------------------------------------------------------
     UTILITAIRES PRIVÉS
  ---------------------------------------------------------------- */

  /**
   * Active / désactive les boutons de la modal fiche.
   * @param {boolean} disabled
   */
  function _setButtonsDisabled(disabled) {
    var btns = document.querySelectorAll('#modal-fiche .btn');
    btns.forEach(function (btn) {
      btn.disabled      = disabled;
      btn.style.opacity = disabled ? '0.45' : '1';
    });
  }

  /**
   * Affiche un toast de notification centré à l'écran pendant 2,5 s.
   * Z-index 500 : visible au-dessus de tout.
   * @param {string} message
   */
  function _afficherToast(message) {
    var toast           = document.createElement('div');
    toast.textContent   = message;
    toast.style.cssText = [
      'position:fixed',
      'top:42%',
      'left:50%',
      'transform:translate(-50%,-50%)',
      'background:rgba(10,10,15,0.97)',
      'color:#f1f5f9',
      'padding:14px 30px',
      'border-radius:50px',
      'border:1px solid rgba(139,92,246,0.5)',
      'font-family:Inter,system-ui,sans-serif',
      'font-size:1rem',
      'font-weight:700',
      'z-index:500',
      'pointer-events:none',
      'text-align:center',
      'box-shadow:0 4px 24px rgba(0,0,0,0.6)',
      'white-space:nowrap'
    ].join(';');

    document.body.appendChild(toast);

    // Faire disparaître après 2,5 s
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2500);
  }

  /* ----------------------------------------------------------------
     API PUBLIQUE
  ---------------------------------------------------------------- */
  return {
    ouvrirModal    : ouvrirModal,
    fermerModal    : fermerModal,
    actionTester   : actionTester,
    actionInspecter: actionInspecter
  };

})();


/* ================================================================
   COMPONENT A-FRAME 1 — clickable-component

   Fix v3 : le cursor A-Frame est supprimé. Le raycasting est géré
   manuellement dans main.js (THREE.Raycaster sur les mesh directs
   avec updateMatrixWorld forcé). Ce composant sert uniquement à
   marquer l'entité comme cliquable via el.dataset.clickable.
   ================================================================ */
AFRAME.registerComponent('clickable-component', {
  init: function () {
    this.el.dataset.clickable = 'true';
  }
});


/* ================================================================
   COMPONENT A-FRAME 2 — testable-component
   Marque l'entité comme testable via el.dataset.testable.
   ================================================================ */
AFRAME.registerComponent('testable-component', {
  init: function () {
    this.el.dataset.testable = 'true';
  }
});


/* ================================================================
   COMPONENT A-FRAME 3 — inspect-component
   Marque l'entité comme inspectable via el.dataset.inspectable.
   ================================================================ */
AFRAME.registerComponent('inspect-component', {
  init: function () {
    this.el.dataset.inspectable = 'true';
  }
});
