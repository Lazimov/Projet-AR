# Marqueur AR — Hiro

## Marqueur utilisé

Ce projet utilise le marqueur **Hiro**, le marqueur par défaut d'AR.js.
Il est intégré nativement dans la bibliothèque — aucun fichier de marqueur
n'est nécessaire dans ce dossier.

## Télécharger et imprimer le marqueur Hiro

Téléchargez l'image du marqueur depuis le dépôt officiel AR.js :

```
https://github.com/AR-js-org/AR.js/blob/master/data/images/hiro.png
```

## Conseils d'impression

- Imprimer en **noir et blanc**, sur papier blanc mat (éviter le papier brillant)
- Taille recommandée : **10 cm × 10 cm** minimum (15 cm pour un meilleur tracking)
- S'assurer que la bordure noire est bien présente et non coupée
- Plastifier éventuellement pour une utilisation prolongée

## Conseils de détection

- Éclairage suffisant et homogène (éviter les reflets sur le marqueur)
- Tenir le smartphone à **20–40 cm** du marqueur
- Le marqueur doit être **plat** (pas de courbure)
- Pointer la caméra **perpendiculairement** au marqueur (angle < 45°)

## Dépannage

| Problème | Solution |
|---|---|
| Le marqueur n'est pas détecté | Vérifier l'éclairage, agrandir le marqueur |
| Détection instable | Éviter les reflets, fond contrasté autour du marqueur |
| Rien ne s'affiche | Vérifier que l'URL est en HTTPS (requis pour la caméra) |
| Caméra refusée | Accorder la permission dans les paramètres du navigateur |
