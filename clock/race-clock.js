// Shared race clock logic used by both the big display and the phone controller.
// The race state lives at /race in Firebase Realtime Database:
//   { status: "ready" | "running" | "finished", startAt: <server ms>, stopAt: <server ms> }
// Every open page listens to /race, so pressing GO on the phone moves every clock at once.

(function () {
  firebase.initializeApp(window.EAGLE_FIREBASE_CONFIG);
  var db = firebase.database();
  var raceRef = db.ref("race");

  // Firebase tells us how far this device's clock is from the server clock.
  // We add that offset so every screen agrees on the elapsed time.
  var serverOffset = 0;
  db.ref(".info/serverTimeOffset").on("value", function (snap) {
    serverOffset = snap.val() || 0;
  });
  function serverNow() { return Date.now() + serverOffset; }

  var state = { status: "ready", startAt: null, stopAt: null };
  var listeners = [];

  raceRef.on("value", function (snap) {
    var v = snap.val() || {};
    state = {
      status: v.status || "ready",
      startAt: v.startAt || null,
      stopAt: v.stopAt || null
    };
    listeners.forEach(function (fn) { fn(state); });
  });

  function elapsedMs() {
    if (state.status === "running" && state.startAt) return Math.max(0, serverNow() - state.startAt);
    if (state.status === "finished" && state.startAt && state.stopAt) return Math.max(0, state.stopAt - state.startAt);
    return 0;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // Returns {main: "00:00", tenths: ".0"}; hours appear only once the race passes an hour.
  function format(ms) {
    var totalTenths = Math.floor(ms / 100);
    var tenths = totalTenths % 10;
    var totalSec = Math.floor(totalTenths / 10);
    var s = totalSec % 60;
    var m = Math.floor(totalSec / 60) % 60;
    var h = Math.floor(totalSec / 3600);
    var main = (h > 0 ? h + ":" + pad(m) : pad(m)) + ":" + pad(s);
    return { main: main, tenths: "." + tenths };
  }

  // Controller actions (writes are only allowed for admins by the database rules).
  function start() {
    return raceRef.set({
      status: "running",
      startAt: firebase.database.ServerValue.TIMESTAMP,
      stopAt: null
    });
  }
  function stop() {
    return raceRef.update({ status: "finished", stopAt: firebase.database.ServerValue.TIMESTAMP });
  }
  function reset() {
    return raceRef.set({ status: "ready", startAt: null, stopAt: null });
  }

  window.RaceClock = {
    onChange: function (fn) { listeners.push(fn); fn(state); },
    getState: function () { return state; },
    elapsedMs: elapsedMs,
    format: format,
    start: start,
    stop: stop,
    reset: reset,
    auth: firebase.auth
  };
})();
