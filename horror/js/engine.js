(function () {
  "use strict";

  var canvas = document.getElementById("game");
  var gl = canvas.getContext("webgl", { antialias: true, alpha: false });
  if (!gl) {
    document.getElementById("nogl").style.display = "flex";
    return;
  }

  var VERT_LIT = [
    "attribute vec3 aPos;",
    "attribute vec3 aNrm;",
    "uniform mat4 uProj;",
    "uniform mat4 uView;",
    "uniform mat4 uModel;",
    "uniform mat3 uNrm;",
    "varying vec3 vNrm;",
    "varying vec3 vWorld;",
    "void main(){",
    "  vec4 w = uModel * vec4(aPos, 1.0);",
    "  vWorld = w.xyz;",
    "  vNrm = uNrm * aNrm;",
    "  gl_Position = uProj * uView * w;",
    "}"
  ].join("\n");

  var FRAG_LIT = [
    "precision mediump float;",
    "varying vec3 vNrm;",
    "varying vec3 vWorld;",
    "uniform vec3 uColor;",
    "uniform vec3 uLightPos;",
    "uniform vec3 uLightColor;",
    "uniform vec3 uAmbient;",
    "uniform vec3 uDirColor;",
    "uniform vec3 uFogColor;",
    "uniform float uFogDensity;",
    "uniform vec3 uEmissive;",
    "uniform vec3 uEye;",
    "void main(){",
    "  vec3 N = normalize(vNrm);",
    "  vec3 Lv = uLightPos - vWorld;",
    "  float d = length(Lv);",
    "  vec3 L = Lv / max(d, 0.001);",
    "  float att = 1.0 / (1.0 + 0.10*d + 0.045*d*d);",
    "  float diff = max(dot(N, L), 0.0);",
    "  vec3 V = normalize(uEye - vWorld);",
    "  vec3 H = normalize(L + V);",
    "  float spec = pow(max(dot(N, H), 0.0), 28.0) * 0.22;",
    "  float dirL = max(dot(N, vec3(0.0, 1.0, 0.0)), 0.0);",
    "  vec3 col = uColor * (uAmbient + uDirColor * dirL) + uColor * uLightColor * diff * att + uLightColor * spec * att + uEmissive;",
    "  float dist = length(uEye - vWorld);",
    "  float fogF = 1.0 - exp(-pow(uFogDensity * dist, 2.0));",
    "  col = mix(col, uFogColor, clamp(fogF, 0.0, 1.0));",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var VERT_FLAT = [
    "attribute vec3 aPos;",
    "uniform mat4 uProj;",
    "uniform mat4 uView;",
    "uniform mat4 uModel;",
    "void main(){ gl_Position = uProj * uView * uModel * vec4(aPos, 1.0); }"
  ].join("\n");

  var FRAG_FLAT = [
    "precision mediump float;",
    "uniform vec3 uColor;",
    "void main(){ gl_FragColor = vec4(uColor, 1.0); }"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  function program(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  var progLit = program(VERT_LIT, FRAG_LIT);
  var progFlat = program(VERT_FLAT, FRAG_FLAT);

  var U = {};
  ["uProj", "uView", "uModel", "uNrm", "uColor", "uLightPos", "uLightColor", "uAmbient", "uDirColor", "uFogColor", "uFogDensity", "uEmissive", "uEye"].forEach(function (n) {
    U[n] = gl.getUniformLocation(progLit, n);
  });
  var UF = { uProj: gl.getUniformLocation(progFlat, "uProj"), uView: gl.getUniformLocation(progFlat, "uView"), uModel: gl.getUniformLocation(progFlat, "uModel"), uColor: gl.getUniformLocation(progFlat, "uColor") };

  function mesh(geo) {
    var m = { count: geo.count };
    m.pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, m.pos);
    gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);
    m.nrm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, m.nrm);
    gl.bufferData(gl.ARRAY_BUFFER, geo.normals, gl.STATIC_DRAW);
    return m;
  }

  function boxGeo(cx, cy, cz, sx, sy, sz) {
    var pos = [], nrm = [];
    function q(a, b, c, d, n) {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]);
      for (var i = 0; i < 6; i++) nrm.push(n[0], n[1], n[2]);
    }
    var x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
    q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
    q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
    q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
    q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
    q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
    return { positions: new Float32Array(pos), normals: new Float32Array(nrm), count: pos.length / 3 };
  }

  var meshMaze, meshDoor, meshProp, meshMonster, meshSkull, meshExit, meshEyes;

  function drawLit(m, model, color, emissive) {
    gl.useProgram(progLit);
    gl.uniformMatrix4fv(U.uModel, false, model);
    gl.uniformMatrix3fv(U.uNrm, false, M4.normalFromMat4(model));
    gl.uniform3fv(U.uColor, color);
    gl.uniform3fv(U.uEmissive, emissive || [0, 0, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.pos);
    var aPos = gl.getAttribLocation(progLit, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.nrm);
    var aNrm = gl.getAttribLocation(progLit, "aNrm");
    gl.enableVertexAttribArray(aNrm);
    gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
  }

  function drawFlat(m, model, color) {
    gl.useProgram(progFlat);
    gl.uniformMatrix4fv(UF.uModel, false, model);
    gl.uniform3fv(UF.uColor, color);
    gl.bindBuffer(gl.ARRAY_BUFFER, m.pos);
    var aPos = gl.getAttribLocation(progFlat, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
  }

  var COLS = 15, ROWS = 15;
  var RELIC_COUNT = 6;

  var state = "menu";
  var g, distFromSpawn, spawnCell, doorCell, monsterCell;
  var relics = [], props = [];
  var monster = null;
  var player = { x: 0, z: 0, yaw: 0, pitch: 0, vy: 0, onGround: true };
  var eyeH = 1.62;
  var keys = {};
  var collected = 0, unlocked = false;
  var startTime = 0, elapsed = 0;
  var stamina = 100;
  var stepT = 0, heartT = 0, flickT = 0;
  var lastT = 0;
  var mouseSens = 0.0023;

  var el = {};
  ["hudRelics", "hudTime", "staminaFill", "overlay", "ovTitle", "ovText", "ovBtn", "menu", "playBtn", "hint", "dmg", "vig", "cross"].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  function setupLevel() {
    g = Grid.genMaze(COLS, ROWS);
    distFromSpawn = Grid.bfsDist(g, 1, 1);
    spawnCell = [1, 1];
    var far = Grid.farthest(g, distFromSpawn);
    doorCell = [far.r, far.c];
    var excl = [spawnCell, doorCell];
    var relicCells = Grid.randomPathCells(g, distFromSpawn, 8, 999, RELIC_COUNT, excl);
    relics = relicCells.map(function (c) {
      return { x: c.x, z: c.z, taken: false, phase: Math.random() * 6.28 };
    });
    var mcells = Grid.randomPathCells(g, distFromSpawn, 10, 999, 1, excl.concat(relicCells.map(function (c) { return [c.r, c.c]; })));
    monsterCell = mcells.length ? [mcells[0].r, mcells[0].c] : [ROWS - 2, COLS - 2];
    monster = Monster.create(g, monsterCell);
    var sc = Grid.center(spawnCell[0], spawnCell[1]);
    player.x = sc[0]; player.z = sc[1];
    player.yaw = Math.PI * 0.25; player.pitch = 0; player.vy = 0;
    collected = 0; unlocked = false; stamina = 100;
    startTime = performance.now(); elapsed = 0;
    props = [];
    var propCells = Grid.randomPathCells(g, distFromSpawn, 3, 999, 10, excl.concat(relicCells.map(function (c) { return [c.r, c.c]; })).concat([monsterCell]));
    props = propCells.map(function (c) { return { x: c.x, z: c.z }; });
    if (!meshMaze) {
      meshMaze = mesh(World.buildMaze(g));
      meshDoor = mesh(World.buildDoor(g, doorCell[0], doorCell[1]));
      meshProp = mesh(World.buildProp());
      meshMonster = mesh(World.buildMonster());
      meshSkull = mesh(World.buildSkull());
      meshExit = mesh(World.buildExitMarker());
      meshEyes = mesh(boxGeo(0, 2.08, 0.23, 0.1, 0.1, 0.03));
      meshEyes2 = mesh(boxGeo(-0.13, 2.08, 0.23, 0.08, 0.08, 0.03));
    } else {
      var nm = mesh(World.buildMaze(g));
      gl.deleteBuffer(meshMaze.pos); gl.deleteBuffer(meshMaze.nrm);
      meshMaze = nm;
      var nd = mesh(World.buildDoor(g, doorCell[0], doorCell[1]));
      gl.deleteBuffer(meshDoor.pos); gl.deleteBuffer(meshDoor.nrm);
      meshDoor = nd;
    }
    updateHUD();
  }
  var meshEyes2;

  function collide(x, z) {
    var r = 0.32;
    var pts = [[x - r, z - r], [x + r, z - r], [x - r, z + r], [x + r, z + r]];
    for (var i = 0; i < 4; i++) {
      var rc = Grid.cellOf(pts[i][0], pts[i][1]);
      if (Grid.isWallCell(g, rc[0], rc[1])) return true;
    }
    return false;
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function updateHUD() {
    el.hudRelics.textContent = collected + " / " + RELIC_COUNT;
    el.hudTime.textContent = fmt(elapsed);
    el.staminaFill.style.width = stamina + "%";
  }

  function showOverlay(title, text, btn) {
    el.ovTitle.textContent = title;
    el.ovText.textContent = text;
    el.ovBtn.textContent = btn;
    el.overlay.classList.remove("hidden");
  }

  function hideOverlay() { el.overlay.classList.add("hidden"); }

  function startGame() {
    Audio8.init();
    Audio8.resume();
    setupLevel();
    state = "playing";
    el.menu.classList.add("hidden");
    hideOverlay();
    el.hint.classList.remove("hidden");
    setTimeout(function () { el.hint.classList.add("hidden"); }, 5000);
    canvas.requestPointerLock && canvas.requestPointerLock();
  }

  function endGame(won) {
    state = won ? "win" : "dead";
    document.exitPointerLock && document.exitPointerLock();
    if (won) {
      Audio8.win();
      showOverlay("Tu t'es échappé !", "Tu as ramassé les " + RELIC_COUNT + " reliques et ouvert la porte en " + fmt(elapsed) + ".", "Rejouer");
    } else {
      Audio8.scream();
      showOverlay("Dévoré...", "La créature t'a trouvé après " + fmt(elapsed) + " et " + collected + "/" + RELIC_COUNT + " reliques.", "Réessayer");
    }
  }

  document.addEventListener("pointerlockchange", function () {
    if (state === "playing" && document.pointerLockElement !== canvas) {
      state = "paused";
      showOverlay("Pause", "Clique sur « Reprendre » pour continuer.", "Reprendre");
    }
  });

  el.ovBtn.addEventListener("click", function () {
    if (state === "paused") {
      state = "playing";
      hideOverlay();
      canvas.requestPointerLock && canvas.requestPointerLock();
    } else {
      startGame();
    }
  });
  el.playBtn.addEventListener("click", startGame);

  document.addEventListener("mousemove", function (e) {
    if (state !== "playing" || document.pointerLockElement !== canvas) return;
    player.yaw -= e.movementX * mouseSens;
    player.pitch -= e.movementY * mouseSens;
    var lim = Math.PI / 2 - 0.05;
    player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
  });

  document.addEventListener("keydown", function (e) {
    keys[e.code] = true;
    if (e.code === "Space") e.preventDefault();
  });
  document.addEventListener("keyup", function (e) { keys[e.code] = false; });

  canvas.addEventListener("click", function () {
    if (state === "playing" && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock && canvas.requestPointerLock();
    }
  });

  function onMonsterEvent(ev, dist) {
    if (ev === "chase") Audio8.growl(18);
    else if (ev === "growl") Audio8.growl(dist);
  }

  function update(dt) {
    elapsed = (performance.now() - startTime) / 1000;

    var run = keys["ShiftLeft"] || keys["ShiftRight"];
    if (run && stamina > 0) stamina = Math.max(0, stamina - dt * 22);
    else stamina = Math.min(100, stamina + dt * 14);
    var speed = run && stamina > 0 ? 5.4 : 3.1;

    var f = [Math.sin(player.yaw), Math.cos(player.yaw)];
    var r = [Math.cos(player.yaw), -Math.sin(player.yaw)];
    var mx = 0, mz = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) { mx += f[0]; mz += f[1]; }
    if (keys["KeyS"] || keys["ArrowDown"]) { mx -= f[0]; mz -= f[1]; }
    if (keys["KeyD"]) { mx += r[0]; mz += r[1]; }
    if (keys["KeyA"]) { mx -= r[0]; mz -= r[1]; }
    var ml = Math.sqrt(mx * mx + mz * mz);
    var moving = ml > 0;
    if (moving) {
      mx /= ml; mz /= ml;
      var nx = player.x + mx * speed * dt;
      if (!collide(nx, player.z)) player.x = nx;
      var nz = player.z + mz * speed * dt;
      if (!collide(player.x, nz)) player.z = nz;
      stepT -= dt * (run ? 1.6 : 1);
      if (stepT <= 0) { Audio8.step(run); stepT = 0.42; }
    }

    var bob = moving ? Math.sin(performance.now() / 130) * 0.05 : 0;
    var eyeY = eyeH + bob;

    var dist = Monster.update(monster, g, { x: player.x, z: player.z }, dt, run && moving, onMonsterEvent);

    for (var i = 0; i < relics.length; i++) {
      var rl = relics[i];
      if (rl.taken) continue;
      var ddx = rl.x - player.x, ddz = rl.z - player.z;
      if (ddx * ddx + ddz * ddz < 1.1) {
        rl.taken = true;
        collected++;
        Audio8.pickup();
        updateHUD();
        if (collected >= RELIC_COUNT && !unlocked) {
          unlocked = true;
          Audio8.unlock();
        }
      }
    }

    var dc = Grid.center(doorCell[0], doorCell[1]);
    var ddx2 = dc[0] - player.x, ddz2 = dc[1] - player.z;
    if (unlocked && ddx2 * ddx2 + ddz2 * ddz2 < 1.6) {
      endGame(true);
      return;
    }
    if (dist < 1.1) {
      endGame(false);
      return;
    }

    if (dist < 11) {
      heartT -= dt;
      if (heartT <= 0) {
        Audio8.heartbeat();
        heartT = 0.35 + (dist / 11) * 0.75;
      }
      el.dmg.style.opacity = Math.max(0, 0.55 - dist * 0.05);
      el.vig.classList.add("danger");
    } else {
      el.dmg.style.opacity = 0;
      el.vig.classList.remove("danger");
    }
    Audio8.setAmbienceLevel(Math.max(0, 1 - dist / 14));

    return { eyeY: eyeY, dist: dist };
  }

  function render(eyeY, t) {
    var w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.008, 0.01, 0.02, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    var proj = M4.perspective(1.22, w / h, 0.05, 120);
    var cp = Math.cos(player.pitch), sp = Math.sin(player.pitch);
    var eye = [player.x, eyeY, player.z];
    var dir = [Math.sin(player.yaw) * cp, sp, Math.cos(player.yaw) * cp];
    var center = [eye[0] + dir[0], eye[1] + dir[1], eye[2] + dir[2]];
    var view = M4.lookAt(eye, center, [0, 1, 0]);

    flickT += 0.016;
    var flick = 0.86 + 0.1 * Math.sin(t * 13.7) * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 31);
    var lightPos = [eye[0] + dir[0] * 0.4, eye[1] - 0.12, eye[2] + dir[2] * 0.4];

    gl.useProgram(progLit);
    gl.uniformMatrix4fv(U.uProj, false, proj);
    gl.uniformMatrix4fv(U.uView, false, view);
    gl.uniform3fv(U.uEye, eye);
    gl.uniform3fv(U.uLightPos, lightPos);
    gl.uniform3fv(U.uLightColor, [1.0 * flick, 0.82 * flick, 0.58 * flick]);
    gl.uniform3fv(U.uAmbient, [0.055, 0.055, 0.085]);
    gl.uniform3fv(U.uDirColor, [0.05, 0.07, 0.12]);
    gl.uniform3fv(U.uFogColor, [0.008, 0.01, 0.02]);
    gl.uniform1f(U.uFogDensity, 0.052);

    drawLit(meshMaze, M4.identity(), [0.42, 0.40, 0.47]);

    for (var i = 0; i < props.length; i++) {
      drawLit(meshProp, M4.multiply(M4.translation(props[i].x, 0, props[i].z), M4.scaling(1, 1, 1)), [0.3, 0.26, 0.3]);
    }

    drawLit(meshDoor, M4.identity(), [0.25, 0.16, 0.1]);

    var dc = Grid.center(doorCell[0], doorCell[1]);
    var pulse = 0.5 + 0.5 * Math.sin(t * 3);
    var em = unlocked ? [0.1 + 0.5 * pulse, 0.8 * pulse + 0.2, 0.15] : [0.05, 0.05, 0.06];
    drawLit(meshExit, M4.translation(dc[0], 0.4 + pulse * 0.15, dc[1]), [0.2, 0.9, 0.3], em);

    for (i = 0; i < relics.length; i++) {
      var rl = relics[i];
      if (rl.taken) continue;
      var ry = 0.85 + Math.sin(t * 2 + rl.phase) * 0.12;
      var model = M4.multiply(M4.translation(rl.x, ry, rl.z), M4.rotationY(t * 1.8 + rl.phase));
      drawLit(meshSkull, model, [0.85, 0.82, 0.7], [0.25 + 0.2 * Math.sin(t * 4 + rl.phase), 0.22, 0.1]);
    }

    var mm = M4.multiply(M4.translation(monster.x, Math.abs(Math.sin(monster.bobT * 6)) * 0.06, monster.z), M4.rotationY(monster.yaw));
    drawLit(meshMonster, mm, [0.16, 0.13, 0.15], [0.12, 0.015, 0.02]);
    drawFlat(meshEyes, mm, [1.0, 0.12, 0.08]);
    drawFlat(meshEyes2, mm, [1.0, 0.12, 0.08]);
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  }
  window.addEventListener("resize", resize);
  resize();

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
    lastT = now;
    if (state === "playing") {
      var r = update(dt);
      if (r) render(r.eyeY, now / 1000);
      el.hudTime.textContent = fmt(elapsed);
      el.staminaFill.style.width = stamina + "%";
    } else if (state === "menu" || state === "paused" || state === "dead" || state === "win") {
      if (!meshMaze) setupLevel();
      render(eyeH, now / 1000);
    }
  }

  setupLevel();
  requestAnimationFrame(frame);
})();
