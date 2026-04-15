/**
 * steps.js — Machine à états de la procédure de diagnostic
 * Auteur : Alexandre
 *
 * Gère les 5 étapes ordonnées du diagnostic virtuel :
 *  1. Inspecter le disjoncteur général
 *  2. Tester l'interrupteur différentiel 30mA
 *  3. Inspecter les disjoncteurs (repérer le défectueux)
 *  4. Tester le disjoncteur défectueux (Chambre 16A)
 *  5. Vérifier le peigne d'alimentation
 *
 * Une seule étape active à la fois.
 * Le composant actif pulse en cyan via ImmaTechAnimations.
 * Déclenche l'événement DOM 'etape-validee' à chaque passage.
 */

window.ImmaTechSteps = (function () {

  /* ----------------------------------------------------------------
     DÉFINITION DES ÉTAPES
  ---------------------------------------------------------------- */
  var ETAPES = [
    {
      id          : 1,
      titre       : 'Inspecter le disjoncteur général',
      instruction : 'Étape 1 : Tapez sur le disjoncteur général pour l\'inspecter',
      composantId : 'comp-disjoncteur-general',
      action      : 'inspect',   // action attendue : 'inspect' ou 'test'
      points      : 15
    },
    {
      id          : 2,
      titre       : 'Tester l\'interrupteur différentiel 30mA',
      instruction : 'Étape 2 : Tapez sur l\'interrupteur différentiel puis appuyez sur "Tester"',
      composantId : 'comp-interrupteur-differentiel',
      action      : 'test',
      points      : 20
    },
    {
      id          : 3,
      titre       : 'Repérer le disjoncteur qui a sauté',
      instruction : 'Étape 3 : Inspectez les disjoncteurs pour trouver celui en défaut (Chambre)',
      composantId : 'comp-disjoncteur-3',
      action      : 'inspect',
      points      : 15
    },
    {
      id          : 4,
      titre       : 'Tester le disjoncteur défectueux',
      instruction : 'Étape 4 : Tapez sur le disjoncteur Chambre 16A puis appuyez sur "Tester"',
      composantId : 'comp-disjoncteur-3',
      action      : 'test',
      points      : 25
    },
    {
      id          : 5,
      titre       : 'Vérifier le peigne d\'alimentation',
      instruction : 'Étape 5 : Inspectez le peigne d\'alimentation pour terminer le diagnostic',
      composantId : 'comp-peigne',
      action      : 'inspect',
      points      : 15
    }
  ];

  /* ----------------------------------------------------------------
     ÉTAT INTERNE
  ---------------------------------------------------------------- */
  var indexCourant = 0;   // index 0-based de l'étape active

  /* ----------------------------------------------------------------
     ACCESSEURS
  ---------------------------------------------------------------- */

  /**
   * Retourne l'étape actuellement active, ou null si terminé.
   * @returns {Object|null}
   */
  function getEtapeCourante() {
    return ETAPES[indexCourant] || null;
  }

  /**
   * Retourne l'index courant (0-based).
   * @returns {number}
   */
  function getIndexCourant() {
    return indexCourant;
  }

  /**
   * Indique si toutes les étapes ont été validées.
   * @returns {boolean}
   */
  function estTermine() {
    return indexCourant >= ETAPES.length;
  }

  /* ----------------------------------------------------------------
     VALIDATION
  ---------------------------------------------------------------- */

  /**
   * Valide l'étape courante et active la suivante.
   * Lance l'événement 'etape-validee' avec le détail.
   * @returns {number}  Points de l'étape validée
   */
  function validerEtapeCourante() {
    if (estTermine()) return 0;

    var etape  = ETAPES[indexCourant];
    var points = etape.points;

    // Arrêter le pulse sur le composant de l'étape terminée
    var compActuel = document.getElementById(etape.composantId);
    if (compActuel) {
      ImmaTechAnimations.stopPulse(compActuel);
    }

    // Marquer le segment de progression comme complété
    _marquerComplete(indexCourant + 1);

    // Avancer à l'étape suivante
    indexCourant++;

    if (!estTermine()) {
      _activerEtape(indexCourant);
    } else {
      // Toutes les étapes validées → mettre à jour l'instruction
      _setInstruction('✅ Diagnostic terminé ! Excellent travail.', '');
    }

    // Émettre un événement personnalisé pour main.js
    document.dispatchEvent(new CustomEvent('etape-validee', {
      detail: {
        points       : points,
        indexPrecedent: indexCourant - 1,
        indexSuivant : indexCourant
      }
    }));

    return points;
  }

  /* ----------------------------------------------------------------
     DÉMARRAGE
  ---------------------------------------------------------------- */

  /**
   * Démarre la machine à états depuis la première étape.
   * Appelé automatiquement à l'initialisation et après chaque reset.
   */
  function demarrer() {
    indexCourant = 0;
    _activerEtape(0);
  }

  /* ----------------------------------------------------------------
     RÉINITIALISATION
  ---------------------------------------------------------------- */

  /**
   * Stoppe tous les pulses, remet les segments à zéro
   * et affiche le message d'attente initial.
   */
  function reinitialiser() {
    // Arrêter tous les pulses actifs
    ETAPES.forEach(function (etape) {
      var comp = document.getElementById(etape.composantId);
      if (comp) ImmaTechAnimations.stopPulse(comp);
    });

    indexCourant = 0;

    // Remettre à zéro tous les segments de progression
    document.querySelectorAll('.progress-step').forEach(function (el) {
      el.classList.remove('active', 'completed');
    });
    document.querySelectorAll('.progress-connector').forEach(function (el) {
      el.classList.remove('completed');
    });

    // Afficher le message d'attente
    _setInstruction(
      'Pointez la caméra vers le marqueur Hiro pour démarrer',
      'Étape 1/5'
    );
  }

  /* ----------------------------------------------------------------
     MÉTHODES PRIVÉES
  ---------------------------------------------------------------- */

  /**
   * Active visuellement une étape (0-based) :
   *  - pulse sur le bon composant
   *  - segment de progression actif
   *  - texte d'instruction mis à jour
   * @param {number} idx  Index 0-based
   */
  function _activerEtape(idx) {
    var etape = ETAPES[idx];
    if (!etape) return;

    // Lancer le pulse sur le composant cible
    var comp = document.getElementById(etape.composantId);
    if (comp) {
      ImmaTechAnimations.startPulse(comp);
    }

    // Mettre à jour l'UI
    _marquerActif(idx + 1);
    _setInstruction(etape.instruction, 'Étape ' + (idx + 1) + '/5');
  }

  /**
   * Marque un segment (1-based) comme "actif" dans la barre de progression.
   * @param {number} numero  Numéro de l'étape (1 à 5)
   */
  function _marquerActif(numero) {
    document.querySelectorAll('.progress-step').forEach(function (el) {
      el.classList.remove('active');
    });
    var el = document.querySelector('.progress-step[data-step="' + numero + '"]');
    if (el) el.classList.add('active');
  }

  /**
   * Marque un segment (1-based) comme "complété" dans la barre de progression.
   * @param {number} numero  Numéro de l'étape (1 à 5)
   */
  function _marquerComplete(numero) {
    var el = document.querySelector('.progress-step[data-step="' + numero + '"]');
    if (el) {
      el.classList.remove('active');
      el.classList.add('completed');
    }
    // Allumer le connecteur entre ce segment et le suivant
    var connectors = document.querySelectorAll('.progress-connector');
    if (connectors[numero - 1]) {
      connectors[numero - 1].classList.add('completed');
    }
  }

  /**
   * Met à jour le texte d'instruction et le compteur d'étape.
   * @param {string} texte    Texte de l'instruction
   * @param {string} compteur Texte du compteur (ex: "Étape 2/5")
   */
  function _setInstruction(texte, compteur) {
    var elTexte    = document.getElementById('instruction-text');
    var elCompteur = document.getElementById('step-counter');
    if (elTexte)    elTexte.textContent    = texte;
    if (elCompteur) elCompteur.textContent = compteur || '';
  }

  /* ----------------------------------------------------------------
     API PUBLIQUE
  ---------------------------------------------------------------- */
  return {
    getEtapeCourante    : getEtapeCourante,
    getIndexCourant     : getIndexCourant,
    estTermine          : estTermine,
    validerEtapeCourante: validerEtapeCourante,
    demarrer            : demarrer,
    reinitialiser       : reinitialiser
  };

})();
