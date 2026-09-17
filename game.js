(function () {
  "use strict";

  // Pool d'emojis variés et distincts pour former les paires.
  var SYMBOLS = [
    "🍎", "🍌", "🍇", "🍒", "🍓", "🍑", "🥝", "🍍",
    "🥕", "🌽", "🍆", "🍅", "🥑", "🍄", "🌶️", "🥒",
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐮", "🐸", "🐵", "🐔", "🐧",
    "🚀", "✈️", "🚗", "🚲", "⛵", "🚂", "🏍️", "🛸",
    "⭐", "🌙", "☀️", "⚡", "🔥", "💧", "❄️", "🌈",
    "🎵", "🎸", "🎹", "🥁", "🎺", "🎻", "🎧", "🎤"
  ];

  var BEST_KEY = "kamona-best-score";
  var BEST_BY_DIFF = {};

  var state = {
    size: 6,
    cards: [],
    first: null,
    second: null,
    lock: false,
    moves: 0,
    pairs: 0,
    startedAt: 0,
    elapsed: 0,
    timerId: null,
    finished: false
  };

  var el = {};
  var flipSound = null;

  function $(id) { return document.getElementById(id); }

  function loadBest() {
    try {
      BEST_BY_DIFF = JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
    } catch (e) {
      BEST_BY_DIFF = {};
    }
  }

  function saveBest(size, seconds) {
    var prev = BEST_BY_DIFF[size];
    if (prev == null || seconds < prev) {
      BEST_BY_DIFF[size] = seconds;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(BEST_BY_DIFF)); } catch (e) {}
      return true;
    }
    return false;
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function buildDeck(size) {
    var total = size * size;
    var pairCount = total / 2;
    var chosen = shuffle(SYMBOLS.slice()).slice(0, pairCount);
    var deck = [];
    for (var i = 0; i < pairCount; i++) {
      deck.push(chosen[i], chosen[i]);
    }
    return shuffle(deck);
  }

  function beep(ok) {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = ok ? 660 : 200;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  function renderBoard() {
    var board = el.board;
    board.innerHTML = "";
    board.style.gridTemplateColumns = "repeat(" + state.size + ", 1fr)";
    state.cards.forEach(function (card, index) {
      var btn = document.createElement("button");
      btn.className = "card";
      btn.setAttribute("type", "button");
      btn.setAttribute("aria-label", "Carte " + (index + 1));
      btn.dataset.index = index;

      var inner = document.createElement("span");
      inner.className = "card-inner";

      var back = document.createElement("span");
      back.className = "card-face card-back";

      var front = document.createElement("span");
      front.className = "card-face card-front";
      front.textContent = card.symbol;

      inner.appendChild(back);
      inner.appendChild(front);
      btn.appendChild(inner);
      btn.addEventListener("click", function () { onFlip(index, btn); });
      board.appendChild(btn);
    });
  }

  function startTimer() {
    if (state.timerId) return;
    state.startedAt = Date.now() - state.elapsed * 1000;
    state.timerId = setInterval(function () {
      if (state.finished) return;
      state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      el.timer.textContent = formatTime(state.elapsed);
    }, 250);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function updateHUD() {
    el.moves.textContent = state.moves;
    el.pairs.textContent = state.pairs;
    el.totalPairs.textContent = (state.size * state.size) / 2;
    el.timer.textContent = formatTime(state.elapsed);
    var best = BEST_BY_DIFF[state.size];
    el.best.textContent = best != null ? formatTime(best) : "—";
  }

  function onFlip(index, btn) {
    if (state.lock || state.finished) return;
    var card = state.cards[index];
    if (card.matched || card.flipped) return;

    if (!state.timerId) startTimer();

    card.flipped = true;
    btn.classList.add("flipped");
    beep(true);

    if (!state.first) {
      state.first = { index: index, btn: btn };
      return;
    }

    state.second = { index: index, btn: btn };
    state.moves++;
    updateHUD();
    state.lock = true;

    var a = state.cards[state.first.index];
    var b = state.cards[state.second.index];

    if (a.symbol === b.symbol) {
      setTimeout(function () {
        a.matched = true;
        b.matched = true;
        state.first.btn.classList.add("matched");
        state.second.btn.classList.add("matched");
        state.pairs++;
        updateHUD();
        resetTurn();
        if (state.pairs === (state.size * state.size) / 2) {
          finish(true);
        }
      }, 350);
    } else {
      setTimeout(function () {
        state.first.btn.classList.add("shake");
        state.second.btn.classList.add("shake");
        beep(false);
        setTimeout(function () {
          a.flipped = false;
          b.flipped = false;
          state.first.btn.classList.remove("flipped", "shake");
          state.second.btn.classList.remove("flipped", "shake");
          resetTurn();
        }, 450);
      }, 700);
    }
  }

  function resetTurn() {
    state.first = null;
    state.second = null;
    state.lock = false;
  }

  function finish(won) {
    state.finished = true;
    stopTimer();
    var seconds = state.elapsed;
    var isBest = won ? saveBest(state.size, seconds) : false;
    el.overlayTitle.textContent = won ? "Bravo ! 🎉" : "Partie terminée";
    var pairCount = (state.size * state.size) / 2;
    var msg;
    if (won) {
      msg = "Tu as trouvé les " + pairCount + " paires en " + state.moves +
        " coups et " + formatTime(seconds) + ".";
      if (isBest) msg += " Nouveau record ! 🏆";
    } else {
      msg = "Tu as trouvé " + state.pairs + " paire(s) sur " + pairCount + ".";
    }
    el.overlayText.textContent = msg;
    el.overlay.classList.remove("hidden");
  }

  function newGame() {
    stopTimer();
    state.size = parseInt(el.difficulty.value, 10);
    state.cards = buildDeck(state.size).map(function (symbol) {
      return { symbol: symbol, flipped: false, matched: false };
    });
    state.first = null;
    state.second = null;
    state.lock = false;
    state.moves = 0;
    state.pairs = 0;
    state.elapsed = 0;
    state.finished = false;
    el.timer.textContent = "00:00";
    el.overlay.classList.add("hidden");
    renderBoard();
    updateHUD();
  }

  function init() {
    el.board = $("board");
    el.moves = $("moves");
    el.pairs = $("pairs");
    el.totalPairs = $("totalPairs");
    el.timer = $("timer");
    el.best = $("best");
    el.difficulty = $("difficulty");
    el.newGame = $("newGame");
    el.overlay = $("overlay");
    el.overlayTitle = $("overlayTitle");
    el.overlayText = $("overlayText");
    el.overlayBtn = $("overlayBtn");
    flipSound = $("flipSound");

    loadBest();
    el.difficulty.addEventListener("change", newGame);
    el.newGame.addEventListener("click", newGame);
    el.overlayBtn.addEventListener("click", newGame);

    newGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
