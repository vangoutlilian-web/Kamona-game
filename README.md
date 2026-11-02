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

---

# Kamona Horror 🕯️👹

Un **jeu 3D de survival horror** jouable dans le navigateur, en **WebGL pur
sans aucune dépendance** (aucun CDN, fonctionne hors-ligne). Il vit dans le
dossier [`horror/`](horror/) — ouvre `horror/index.html` (ou sers le dépôt avec
`python3 -m http.server` et va sur `http://localhost:8000/horror/`).

## Principe

Tu es enfermé dans un **labyrinthe procédural** plongé dans le noir. Une
créature rôde. Ramasse les **6 reliques** (crânes lumineux) pour déverrouiller
la porte de sortie (croix verte), puis atteins-la avant d'être dévoré.

## Contrôles

- **WASD / flèches** — se déplacer
- **Souris** — regarder (pointer lock)
- **Shift** — courir (endurance limitée)

## Technique

```
horror/
  index.html      # page + HUD + menus
  style.css       # ambiance (vignette, dégâts, panneaux)
  js/math.js      # vecteurs / matrices 4x4 (perspective, lookAt, normale)
  js/grid.js      # génération du labyrinthe, BFS, champ de vision (LOS)
  js/world.js     # géométrie 3D : labyrinthe, porte, piliers, monstre, reliques
  js/monster.js   # IA de la créature (patrouille / poursuite par BFS)
  js/audio.js     # sons procéduraux WebAudio (ambiance, grognements, cœur)
  js/engine.js    # moteur WebGL (shaders), boucle de jeu, collisions, HUD
```

Rendu : shader maison avec lampe torche (atténuation + spéculaire), fog
exponentiel, matériaux émissifs ; déplacement avec collision cercle/murs ;
monstre qui patrouille et poursuit par plus court chemin dès qu'il te voit ou
t'entend courir ; jauge d'endurance, battements de cœur quand il est proche.
