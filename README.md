# Kamona 🂠

Un petit jeu de mémoire (memory game) jouable directement dans le navigateur,
sans aucune installation ni dépendance. Ouvre simplement `index.html` dans un
navigateur et joue !

## Comment jouer

1. Ouvre `index.html` dans un navigateur (double-clic, ou `File > Open`).
2. Choisis la difficulté :
   - **Facile** — grille 4×4 (8 paires)
   - **Normal** — grille 6×6 (18 paires)
   - **Difficile** — grille 8×8 (32 paires)
3. Clique sur une carte pour la retourner, puis sur une deuxième pour former une paire.
4. Trouve toutes les paires dans le moins de coups et le moins de temps possible.
5. Ton meilleur temps par difficulté est sauvegardé localement (localStorage).

## Aperçu

```
index.html   # structure de la page
style.css    # mise en forme + animations 3D des cartes
game.js      # logique du jeu (mélange, retournement, score, minuterie)
```

## Fichiers

- `index.html` — la page HTML du jeu.
- `style.css` — styles, thème, animations de retournement 3D et de « shake ».
- `game.js` — logique : génération du plateau, gestion des clics, paires, score,
  minuterie et record sauvegardé dans le navigateur.

## Lancer en local (optionnel)

```bash
python3 -m http.server 8000
```

Puis ouvre <http://localhost:8000> dans ton navigateur.

Aucune compilation, aucun build, aucune dépendance — du HTML/CSS/JS pur.
