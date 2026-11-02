(function (global) {
  "use strict";

  var Monster = {};

  Monster.create = function (g, cell) {
    var c = Grid.center(cell[0], cell[1]);
    return {
      x: c[0], z: c[1],
      yaw: 0,
      speed: 2.1,
      chaseSpeed: 3.6,
      state: "patrol",
      path: null,
      pathIdx: 0,
      repathT: 0,
      heardT: 0,
      growlT: 0,
      bobT: 0,
      alert: 0
    };
  };

  Monster.update = function (m, g, player, dt, running, onEvent) {
    var dx = player.x - m.x, dz = player.z - m.z;
    var dist = Math.sqrt(dx * dx + dz * dz);
    var canSee = dist < 16 && Grid.losClear(g, m.x, m.z, player.x, player.z);
    var hears = running && dist < 12;

    if (canSee || hears) {
      if (m.state !== "chase") { m.state = "chase"; if (onEvent) onEvent("chase"); }
      m.alert = Math.min(1, m.alert + dt * 2.5);
    } else {
      m.alert = Math.max(0, m.alert - dt * 0.25);
      if (m.state === "chase" && m.alert <= 0.05) { m.state = "patrol"; m.path = null; }
    }

    m.heardT -= dt;
    m.growlT -= dt;
    m.bobT += dt;

    var speed = m.state === "chase" ? m.chaseSpeed : m.speed;
    var tx, tz;

    if (m.state === "chase") {
      m.repathT -= dt;
      if (m.repathT <= 0 || !m.path) {
        var pc = Grid.cellOf(player.x, player.z);
        var mc = Grid.cellOf(m.x, m.z);
        m.path = Grid.bfsPath(g, mc[0], mc[1], pc[0], pc[1]);
        m.pathIdx = 1;
        m.repathT = canSee ? 0.4 : 0.9;
      }
      if (m.path && m.pathIdx < m.path.length) {
        var cell = m.path[m.pathIdx];
        var ctr = Grid.center(cell[0], cell[1]);
        tx = ctr[0]; tz = ctr[1];
        var ddx = tx - m.x, ddz = tz - m.z;
        if (Math.sqrt(ddx * ddx + ddz * ddz) < 0.35) m.pathIdx++;
      } else {
        tx = player.x; tz = player.z;
      }
      if (m.growlT <= 0) { if (onEvent) onEvent("growl", dist); m.growlT = Math.max(1.2, 4 - dist * 0.15); }
    } else {
      if (!m.path || m.pathIdx >= m.path.length) {
        var from = Grid.cellOf(m.x, m.z);
        var target = Grid.randomCell(g);
        var tries = 0;
        while (tries++ < 10) {
          var d = Grid.bfsDist(g, from[0], from[1]);
          if (d[target[0] * g[0].length + target[1]] > 3) break;
          target = Grid.randomCell(g);
        }
        m.path = Grid.bfsPath(g, from[0], from[1], target[0], target[1]);
        m.pathIdx = 1;
      }
      if (m.path && m.pathIdx < m.path.length) {
        var cell2 = m.path[m.pathIdx];
        var ctr2 = Grid.center(cell2[0], cell2[1]);
        tx = ctr2[0]; tz = ctr2[1];
        var dd2x = tx - m.x, dd2z = tz - m.z;
        if (Math.sqrt(dd2x * dd2x + dd2z * dd2z) < 0.35) m.pathIdx++;
      } else {
        tx = m.x; tz = m.z;
      }
    }

    var mx = tx - m.x, mz = tz - m.z;
    var ml = Math.sqrt(mx * mx + mz * mz);
    if (ml > 0.01) {
      var step = Math.min(speed * dt, ml);
      m.x += (mx / ml) * step;
      m.z += (mz / ml) * step;
      m.yaw = Math.atan2(mx, mz);
    }

    var cellR = Grid.cellOf(m.x, m.z);
    if (Grid.isWallCell(g, cellR[0], cellR[1])) {
      var c = Grid.center(cellR[0], cellR[1]);
      m.x = c[0]; m.z = c[1];
    }

    return dist;
  };

  global.Monster = Monster;
  if (typeof module !== "undefined" && module.exports) module.exports = Monster;
})(typeof window !== "undefined" ? window : globalThis);
