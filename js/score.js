/**
 * score.js — Gestion du score, timer, erreurs et persistance
 * Auteur : Yaniss
 *
 * Responsabilités :
 *  - ajouterPoints / retirerPoints  : mise à jour du score
 *  - ajouterErreur                  : compteur d'erreurs + pénalité
 *  - demarrerTimer / stopperTimer   : chronomètre en temps réel
 *  - getMeilleurScore               : lecture depuis localStorage
 *  - sauvegarderMeilleurScore       : écriture dans localStorage
 *  - afficherEcranFin               : modale récapitulative
 *  - reset                          : remise à zéro complète
 */

window.ImmaTechScore = (function () {

  /* ----------------------------------------------------------------
     CONSTANTE — clé de stockage localStorage
  ---------------------------------------------------------------- */
  var CLE_MEILLEUR_SCORE = 'immatech_meilleur_score';

  /* ----------------------------------------------------------------
     ÉTAT INTERNE
  ---------------------------------------------------------------- */
  var score            = 0;
  var erreurs          = 0;
  var timerInterval    = null;
  var secondes         = 0;
  var timerDemarre     = false;

  /* ----------------------------------------------------------------
     SCORE
  ---------------------------------------------------------------- */

  /**
   * Ajoute nb points au score et rafraîchit l'affichage.
   * @param {number} nb  Nombre de points à ajouter
   */
  function ajouterPoints(nb) {
    score = Math.max(0, score + nb);
    _mettreAJourScore();
  }

  /**
   * Retire nb points du score (plancher à 0).
   * @param {number} nb  Nombre de points à retirer
   */
  function retirerPoints(nb) {
    score = Math.max(0, score - nb);
    _mettreAJourScore();
  }

  /**
   * Enregistre une erreur : +1 erreur, -5 points, flash rouge.
   */
  function ajouterErreur() {
    erreurs++;
    retirerPoints(5);
    ImmaTechAnimations.flashErreur();
  }

  /* ----------------------------------------------------------------
     TIMER
  ---------------------------------------------------------------- */

  /**
   * Démarre le chronomètre. Idempotent (ne redémarre pas si déjà actif).
   */
  function demarrerTimer() {
    if (timerDemarre) return;
    timerDemarre = true;
    timerInterval = setInterval(function () {
      secondes++;
      _mettreAJourTimer();
    }, 1000);
  }

  /**
   * Stoppe le chronomètre.
   */
  function stopperTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerDemarre = false;
  }

  /* ----------------------------------------------------------------
     ACCESSEURS
  ---------------------------------------------------------------- */

  /** @returns {number} Score courant */
  function getScore() {
    return score;
  }

  /** @returns {number} Nombre d'erreurs */
  function getErreurs() {
    return erreurs;
  }

  /**
   * Retourne le temps écoulé au format mm:ss.
   * @returns {string}
   */
  function getTempsFormate() {
    var min = Math.floor(secondes / 60);
    var sec = secondes % 60;
    return _pad(min) + ':' + _pad(sec);
  }

  /* ----------------------------------------------------------------
     PERSISTANCE
  ---------------------------------------------------------------- */

  /**
   * Sauvegarde le score en localStorage si c'est un nouveau record.
   */
  function sauvegarderMeilleurScore() {
    if (score > getMeilleurScore()) {
      try {
        localStorage.setItem(CLE_MEILLEUR_SCORE, String(score));
      } catch (e) {
        console.warn('[ImmaTech] localStorage indisponible :', e);
      }
    }
  }

  /**
   * Lit le meilleur score depuis localStorage.
   * @returns {number}
   */
  function getMeilleurScore() {
    try {
      var val = localStorage.getItem(CLE_MEILLEUR_SCORE);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  /* ----------------------------------------------------------------
     ÉCRAN DE FIN
  ---------------------------------------------------------------- */

  /**
   * Stoppe le timer, sauvegarde le score et affiche la modale de fin.
   */
  function afficherEcranFin() {
    stopperTimer();
    sauvegarderMeilleurScore();

    // Remplir les statistiques
    var elScore   = document.getElementById('fin-score');
    var elTemps   = document.getElementById('fin-temps');
    var elErreurs = document.getElementById('fin-erreurs');
    var elBest    = document.getElementById('fin-best');

    if (elScore)   elScore.textContent   = score;
    if (elTemps)   elTemps.textContent   = getTempsFormate();
    if (elErreurs) elErreurs.textContent = erreurs;
    if (elBest)    elBest.textContent    = getMeilleurScore();

    // Afficher la modale de fin
    var modalFin = document.getElementById('modal-fin');
    if (modalFin) modalFin.style.display = 'flex';
  }

  /* ----------------------------------------------------------------
     REMISE À ZÉRO
  ---------------------------------------------------------------- */

  /**
   * Remet l'état complet à zéro : score, timer, erreurs, UI, étapes.
   */
  function reset() {
    stopperTimer();
    score        = 0;
    erreurs      = 0;
    secondes     = 0;
    timerDemarre = false;

    // Fermer les modales ouvertes
    var modalFiche = document.getElementById('modal-fiche');
    var modalFin   = document.getElementById('modal-fin');
    if (modalFiche) modalFiche.style.display = 'none';
    if (modalFin)   modalFin.style.display   = 'none';

    // Rafraîchir l'affichage
    _mettreAJourScore();
    _mettreAJourTimer();

    // Réinitialiser les composants 3D et animations
    ImmaTechAnimations.reinitialiserComposants();

    // Réinitialiser la machine à états des étapes
    ImmaTechSteps.reinitialiser();

    // Redémarrer les étapes après un court délai
    // (laisse le temps aux animations de se couper)
    setTimeout(function () {
      ImmaTechSteps.demarrer();
    }, 150);
  }

  /* ----------------------------------------------------------------
     MÉTHODES PRIVÉES
  ---------------------------------------------------------------- */

  /** Met à jour l'affichage du score dans le DOM */
  function _mettreAJourScore() {
    var el = document.getElementById('score-value');
    if (el) el.textContent = score;
  }

  /** Met à jour l'affichage du timer dans le DOM */
  function _mettreAJourTimer() {
    var el = document.getElementById('timer-value');
    if (el) el.textContent = getTempsFormate();
  }

  /** Formate un nombre sur 2 chiffres avec zéro initial */
  function _pad(n) {
    return String(n).padStart(2, '0');
  }

  /* ----------------------------------------------------------------
     API PUBLIQUE
  ---------------------------------------------------------------- */
  return {
    ajouterPoints         : ajouterPoints,
    retirerPoints         : retirerPoints,
    ajouterErreur         : ajouterErreur,
    demarrerTimer         : demarrerTimer,
    stopperTimer          : stopperTimer,
    getScore              : getScore,
    getErreurs            : getErreurs,
    getTempsFormate       : getTempsFormate,
    getMeilleurScore      : getMeilleurScore,
    sauvegarderMeilleurScore: sauvegarderMeilleurScore,
    afficherEcranFin      : afficherEcranFin,
    reset                 : reset
  };

})();
