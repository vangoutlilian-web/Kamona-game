(function (global) {
  "use strict";

  var Grid = {};
  Grid.CELL = 4;
  Grid.HEIGHT = 3.2;

  Grid.genMaze = function (cols, rows) {
    var g = [];
    for (var r = 0; r < rows; r++) g.push(new Array(cols).fill(1));
    var stack = [[1, 1]];
    g[1][1] = 0;
    var dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    while (stack.length) {
      var top = stack[stack.length - 1];
      var c = top[0], r = top[1];
      var opts = [];
      for (var d = 0; d < 4; d++) {
        var nc = c + dirs[d][0], nr = r + dirs[d][1];
        if (nc > 0 && nc < cols - 1 && nr > 0 && nr < rows - 1 && g[nr][nc] === 1) {
          opts.push([nc, nr]);
        }
      }
      if (!opts.length) { stack.pop(); continue; }
      var pick = opts[(Math.random() * opts.length) | 0];
      g[(r + pick[1]) / 2][(c + pick[0]) / 2] = 0;
      g[pick[1]][pick[0]] = 0;
      stack.push(pick);
    }
    var extra = Math.floor(cols * rows * 0.07);
    for (var i = 0; i < extra; i++) {
      var cc = 1 + ((Math.random() * (cols - 2)) | 0);
      var rr = 1 + ((Math.random() * (rows - 2)) | 0);
      if (g[rr][cc] !== 1) continue;
      var horiz = g[rr][cc - 1] === 0 && g[rr][cc + 1] === 0;
      var vert = g[rr - 1][cc] === 0 && g[rr + 1][cc] === 0;
      if (horiz || vert) g[rr][cc] = 0;
    }
    return g;
  };

  Grid.isWallCell = function (g, r, c) {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length) return true;
    return g[r][c] === 1;
  };

  Grid.cellOf = function (x, z) {
    return [Math.floor(z / Grid.CELL), Math.floor(x / Grid.CELL)];
  };

  Grid.center = function (r, c) {
    return [(c + 0.5) * Grid.CELL, (r + 0.5) * Grid.CELL];
  };

  Grid.bfsDist = function (g, sr, sc) {
    var rows = g.length, cols = g[0].length;
    var dist = new Int16Array(rows * cols).fill(-1);
    var q = [[sr, sc]];
    dist[sr * cols + sc] = 0;
    while (q.length) {
      var cur = q.shift();
      var r = cur[0], c = cur[1], d = dist[r * cols + c];
      var nb = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]];
      for (var i = 0; i < 4; i++) {
        var nr = nb[i][0], nc = nb[i][1];
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (g[nr][nc] === 1) continue;
        var idx = nr * cols + nc;
        if (dist[idx] !== -1) continue;
        dist[idx] = d + 1;
        q.push([nr, nc]);
      }
    }
    return dist;
  };

  Grid.farthest = function (g, dist) {
    var rows = g.length, cols = g[0].length;
    var best = { r: 1, c: 1, d: -1 };
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var d = dist[r * cols + c];
        if (d > best.d) best = { r: r, c: c, d: d };
      }
    }
    return best;
  };

  Grid.bfsPath = function (g, sr, sc, tr, tc) {
    var rows = g.length, cols = g[0].length;
    if (Grid.isWallCell(g, tr, tc)) return null;
    var prev = new Int32Array(rows * cols).fill(-2);
    var startIdx = sr * cols + sc;
    prev[startIdx] = startIdx;
    var q = [[sr, sc]];
    while (q.length) {
      var cur = q.shift();
      var r = cur[0], c = cur[1];
      if (r === tr && c === tc) break;
      var nb = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]];
      for (var i = 0; i < 4; i++) {
        var nr = nb[i][0], nc = nb[i][1];
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (g[nr][nc] === 1) continue;
        var idx = nr * cols + nc;
        if (prev[idx] !== -2) continue;
        prev[idx] = r * cols + c;
        q.push([nr, nc]);
      }
    }
    var tIdx = tr * cols + tc;
    if (prev[tIdx] === -2) return null;
    var path = [];
    var cur2 = tIdx;
    while (cur2 !== startIdx) {
      path.push([Math.floor(cur2 / cols), cur2 % cols]);
      cur2 = prev[cur2];
    }
    path.push([sr, sc]);
    path.reverse();
    return path;
  };

  Grid.losClear = function (g, x0, z0, x1, z1) {
    var dx = x1 - x0, dz = z1 - z0;
    var d = Math.sqrt(dx * dx + dz * dz);
    var steps = Math.max(1, Math.ceil(d / 0.2));
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var rc = Grid.cellOf(x0 + dx * t, z0 + dz * t);
      if (Grid.isWallCell(g, rc[0], rc[1])) return false;
    }
    return true;
  };

  Grid.randomCell = function (g) {
    var rows = g.length, cols = g[0].length, cells = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (g[r][c] === 0) cells.push([r, c]);
      }
    }
    return cells[(Math.random() * cells.length) | 0];
  };

  Grid.randomPathCells = function (g, dist, minD, maxD, n, exclude) {
    var rows = g.length, cols = g[0].length, out = [];
    var tries = 0;
    while (out.length < n && tries < 800) {
      tries++;
      var r = 1 + ((Math.random() * (rows - 2)) | 0);
      var c = 1 + ((Math.random() * (cols - 2)) | 0);
      if (g[r][c] !== 0) continue;
      var d = dist[r * cols + c];
      if (d < minD || d > maxD) continue;
      var bad = false;
      for (var i = 0; i < exclude.length; i++) {
        if (exclude[i][0] === r && exclude[i][1] === c) { bad = true; break; }
      }
      if (!bad) {
        for (i = 0; i < out.length; i++) {
          if (out[i].r === r && out[i].c === c) { bad = true; break; }
        }
      }
      if (bad) continue;
      var ctr = Grid.center(r, c);
      out.push({ r: r, c: c, x: ctr[0], z: ctr[1], taken: false });
    }
    return out;
  };

  global.Grid = Grid;
  if (typeof module !== "undefined" && module.exports) module.exports = Grid;
})(typeof window !== "undefined" ? window : globalThis);
