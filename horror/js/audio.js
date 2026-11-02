(function (global) {
  "use strict";

  var A = {};
  A.ctx = null;
  A.master = null;
  A.ambience = null;
  A.ambGain = null;
  A.heartbeatT = 0;

  A.init = function () {
    if (A.ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      A.ctx = new AC();
      A.master = A.ctx.createGain();
      A.master.gain.value = 0.5;
      A.master.connect(A.ctx.destination);
      A.startAmbience();
      return true;
    } catch (e) {
      return false;
    }
  };

  A.resume = function () {
    if (A.ctx && A.ctx.state === "suspended") A.ctx.resume();
  };

  A.startAmbience = function () {
    if (!A.ctx || A.ambience) return;
    var ctx = A.ctx;
    var len = ctx.sampleRate * 4;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    var filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 320;
    var g = ctx.createGain();
    g.gain.value = 0.16;
    src.connect(filt);
    filt.connect(g);
    g.connect(A.master);
    src.start();
    A.ambience = src;
    A.ambGain = g;
  };

  A.tone = function (freq, dur, type, vol, slideTo) {
    if (!A.ctx) return;
    var ctx = A.ctx;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(A.master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.05);
  };

  A.noise = function (dur, vol, lowpass) {
    if (!A.ctx) return;
    var ctx = A.ctx;
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = lowpass || 800;
    var g = ctx.createGain();
    g.gain.value = vol || 0.3;
    src.connect(filt);
    filt.connect(g);
    g.connect(A.master);
    src.start();
  };

  A.pickup = function () {
    A.tone(520, 0.12, "sine", 0.18);
    setTimeout(function () { A.tone(780, 0.18, "sine", 0.18); }, 90);
    setTimeout(function () { A.tone(1040, 0.25, "sine", 0.15); }, 180);
  };

  A.step = function (running) {
    A.noise(0.09, running ? 0.12 : 0.07, running ? 500 : 380);
  };

  A.growl = function (dist) {
    var vol = Math.max(0.05, Math.min(0.4, 0.45 - dist * 0.02));
    A.tone(70, 0.7, "sawtooth", vol, 45);
    A.tone(48, 0.8, "square", vol * 0.6, 30);
    A.noise(0.6, vol * 0.5, 200);
  };

  A.scream = function () {
    A.noise(1.4, 0.5, 1200);
    A.tone(220, 1.2, "sawtooth", 0.4, 60);
    A.tone(233, 1.1, "square", 0.3, 55);
  };

  A.heartbeat = function (rate) {
    A.tone(55, 0.12, "sine", 0.5);
    setTimeout(function () { A.tone(50, 0.1, "sine", 0.35); }, 140);
  };

  A.unlock = function () {
    A.tone(180, 0.4, "square", 0.2, 90);
    setTimeout(function () { A.tone(360, 0.5, "sine", 0.2); }, 200);
  };

  A.win = function () {
    var notes = [392, 494, 587, 784];
    for (var i = 0; i < notes.length; i++) {
      (function (n, t) {
        setTimeout(function () { A.tone(n, 0.4, "sine", 0.2); }, t);
      })(notes[i], i * 160);
    }
  };

  A.setAmbienceLevel = function (v) {
    if (A.ambGain) A.ambGain.gain.value = 0.05 + v * 0.2;
  };

  global.Audio8 = A;
})(typeof window !== "undefined" ? window : globalThis);
