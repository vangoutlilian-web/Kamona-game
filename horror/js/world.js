(function (global) {
  "use strict";

  var World = {};

  function pushQuad(v, a, b, c, d) {
    v.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    v.push(a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]);
  }

  World.buildMaze = function (g) {
    var CELL = Grid.CELL, H = Grid.HEIGHT;
    var rows = g.length, cols = g[0].length;
    var pos = [], nrm = [];

    pushQuad(pos, [0, 0, 0], [cols * CELL, 0, 0], [cols * CELL, 0, rows * CELL], [0, 0, rows * CELL]);
    nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);

    var w = cols * CELL, d = rows * CELL;
    pushQuad(pos, [0, H, w], [0, H, 0], [w, H, 0], [w, H, w]);
    nrm.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (g[r][c] !== 1) continue;
        var x0 = c * CELL, z0 = r * CELL, x1 = x0 + CELL, z1 = z0 + CELL;
        if (c === 0 || g[r][c - 1] === 0) {
          pushQuad(pos, [x0, 0, z0], [x0, 0, z1], [x0, H, z1], [x0, H, z0]);
          nrm.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
        }
        if (c === cols - 1 || g[r][c + 1] === 0) {
          pushQuad(pos, [x1, 0, z1], [x1, 0, z0], [x1, H, z0], [x1, H, z1]);
          nrm.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
        }
        if (r === 0 || g[r - 1][c] === 0) {
          pushQuad(pos, [x1, 0, z0], [x0, 0, z0], [x0, H, z0], [x1, H, z0]);
          nrm.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
        }
        if (r === rows - 1 || g[r + 1][c] === 0) {
          pushQuad(pos, [x0, 0, z1], [x1, 0, z1], [x1, H, z1], [x0, H, z1]);
          nrm.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
        }
      }
    }
    return {
      positions: new Float32Array(pos),
      normals: new Float32Array(nrm),
      count: pos.length / 3
    };
  };

  World.buildDoor = function (g, r, c) {
    var CELL = Grid.CELL, H = Grid.HEIGHT;
    var x0 = c * CELL, z0 = r * CELL, x1 = x0 + CELL, z1 = z0 + CELL;
    var pos = [], nrm = [];
    var topY = H - 0.9;
    pushQuad(pos, [x0, topY, z0], [x0, topY, z1], [x0, H, z1], [x0, H, z0]);
    nrm.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
    pushQuad(pos, [x1, topY, z1], [x1, topY, z0], [x1, H, z0], [x1, H, z1]);
    nrm.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0);
    pushQuad(pos, [x0, 0, z0], [x1, 0, z0], [x1, topY, z0], [x0, topY, z0]);
    nrm.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    pushQuad(pos, [x0, 0, z1], [x1, 0, z1], [x1, topY, z1], [x0, topY, z1]);
    nrm.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
    pushQuad(pos, [x0, topY, z0], [x1, topY, z0], [x1, topY, z1], [x0, topY, z1]);
    nrm.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0);
    pushQuad(pos, [x0, 0, z0], [x0, 0, z1], [x1, 0, z1], [x1, 0, z0]);
    nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    return {
      positions: new Float32Array(pos),
      normals: new Float32Array(nrm),
      count: pos.length / 3
    };
  };

  World.buildProp = function () {
    var pos = [], nrm = [];
    var seg = 10, rad = 0.28, h = 1.7;
    for (var i = 0; i < seg; i++) {
      var a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      var x0 = Math.cos(a0) * rad, z0 = Math.sin(a0) * rad;
      var x1 = Math.cos(a1) * rad, z1 = Math.sin(a1) * rad;
      pushQuad(pos, [x0, 0, z0], [x1, 0, z1], [x1, h, z1], [x0, h, z0]);
      var nx = Math.cos((a0 + a1) / 2), nz = Math.sin((a0 + a1) / 2);
      nrm.push(nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz);
    }
    var cx = Math.cos(Math.PI / seg) * rad;
    pushQuad(pos, [0, h, -cx], [0, h, cx], [cx, h, cx], [cx, h, -cx]);
    nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    return {
      positions: new Float32Array(pos),
      normals: new Float32Array(nrm),
      count: pos.length / 3
    };
  };

  World.buildMonster = function () {
    var pos = [], nrm = [];
    function box(cx, cy, cz, sx, sy, sz) {
      var x0 = cx - sx / 2, x1 = cx + sx / 2;
      var y0 = cy - sy / 2, y1 = cy + sy / 2;
      var z0 = cz - sz / 2, z1 = cz + sz / 2;
      pushQuad(pos, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); nrm.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]); nrm.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      pushQuad(pos, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]); nrm.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      pushQuad(pos, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]); nrm.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]); nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]); nrm.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
    }
    box(0, 0.55, 0, 0.42, 0.75, 0.34);
    box(0, 1.25, 0, 0.62, 0.95, 0.42);
    box(0, 2.05, 0, 0.42, 0.42, 0.4);
    box(-0.42, 1.35, 0, 0.22, 0.85, 0.22);
    box(0.42, 1.35, 0, 0.22, 0.85, 0.22);
    box(-0.16, 0.12, 0, 0.2, 0.55, 0.2);
    box(0.16, 0.12, 0, 0.2, 0.55, 0.2);
    box(0, 2.08, 0.22, 0.09, 0.09, 0.02);
    box(0, 2.08, -0.22, 0.09, 0.09, 0.02);
    return {
      positions: new Float32Array(pos),
      normals: new Float32Array(nrm),
      count: pos.length / 3
    };
  };

  World.buildSkull = function () {
    var pos = [], nrm = [];
    function box(cx, cy, cz, sx, sy, sz) {
      var x0 = cx - sx / 2, x1 = cx + sx / 2;
      var y0 = cy - sy / 2, y1 = cy + sy / 2;
      var z0 = cz - sz / 2, z1 = cz + sz / 2;
      pushQuad(pos, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); nrm.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]); nrm.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      pushQuad(pos, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]); nrm.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      pushQuad(pos, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]); nrm.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]); nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]); nrm.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
    }
    box(0, 0.16, 0, 0.3, 0.26, 0.28);
    box(0, 0.36, 0, 0.34, 0.18, 0.3);
    box(-0.07, 0.34, 0.16, 0.06, 0.07, 0.05);
    box(0.07, 0.34, 0.16, 0.06, 0.07, 0.05);
    box(0, 0.18, 0.15, 0.05, 0.06, 0.03);
    return {
      positions: new Float32Array(pos),
      normals: new Float32Array(nrm),
      count: pos.length / 3
    };
  };

  World.buildExitMarker = function () {
    var pos = [], nrm = [];
    function box(cx, cy, cz, sx, sy, sz) {
      var x0 = cx - sx / 2, x1 = cx + sx / 2;
      var y0 = cy - sy / 2, y1 = cy + sy / 2;
      var z0 = cz - sz / 2, z1 = cz + sz / 2;
      pushQuad(pos, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); nrm.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]); nrm.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      pushQuad(pos, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]); nrm.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
      pushQuad(pos, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]); nrm.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]); nrm.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
      pushQuad(pos, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]); nrm.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);
    }
    box(0, 0.8, 0, 0.06, 1.6, 0.06);
    box(0, 0.8, 0, 0.06, 0.06, 1.6);
    box(0, 1.55, 0, 0.24, 0.1, 0.24);
    return {
      positions: new Float32Array(pos),
      normals: new Float32Array(nrm),
      count: pos.length / 3
    };
  };

  global.World = World;
  if (typeof module !== "undefined" && module.exports) module.exports = World;
})(typeof window !== "undefined" ? window : globalThis);
