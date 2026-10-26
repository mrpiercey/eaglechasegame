// Shared logic for every Eagle Chase clock page.
// Data lives in Firebase Realtime Database:
//   race      { status: "ready" | "running" | "finished", startAt, stopAt }   (server ms)
//   runners   { <bib>: { bib, first, last, gender: "M"|"F"|"", age } }
//   finishes  { <bib>: { bib, elapsed (ms), at (server ms), by (email) } }
//   staff     { <uid>: { email } }   people allowed to type finishes
//   requests  { <uid>: { email } }   people waiting to be approved
// Every open page listens live, so one GO or one bib entry shows up everywhere at once.

(function () {
  firebase.initializeApp(window.EAGLE_FIREBASE_CONFIG);
  var db = firebase.database();
  var raceRef = db.ref("race");

  // Firebase tells us how far this device's clock is from the server clock.
  var serverOffset = 0;
  db.ref(".info/serverTimeOffset").on("value", function (snap) { serverOffset = snap.val() || 0; });
  function serverNow() { return Date.now() + serverOffset; }

  var state = { status: "ready", startAt: null, stopAt: null };
  var listeners = [];
  raceRef.on("value", function (snap) {
    var v = snap.val() || {};
    state = { status: v.status || "ready", startAt: v.startAt || null, stopAt: v.stopAt || null };
    listeners.forEach(function (fn) { fn(state); });
  });

  function elapsedMs() {
    if (state.status === "running" && state.startAt) return Math.max(0, serverNow() - state.startAt);
    if (state.status === "finished" && state.startAt && state.stopAt) return Math.max(0, state.stopAt - state.startAt);
    return 0;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // {main: "24:38", tenths: ".7"}; hours show only once the race passes an hour.
  function format(ms) {
    var totalTenths = Math.floor(ms / 100);
    var tenths = totalTenths % 10;
    var totalSec = Math.floor(totalTenths / 10);
    var s = totalSec % 60, m = Math.floor(totalSec / 60) % 60, h = Math.floor(totalSec / 3600);
    return { main: (h > 0 ? h + ":" + pad(m) : pad(m)) + ":" + pad(s), tenths: "." + tenths };
  }
  function formatFull(ms) { var f = format(ms); return f.main + f.tenths; }

  // Age groups used on the results board.
  var AGE_GROUPS = [
    { key: "0-12", label: "12 and under", min: 0, max: 12 },
    { key: "13-17", label: "13 to 17", min: 13, max: 17 },
    { key: "18-29", label: "18 to 29", min: 18, max: 29 },
    { key: "30-39", label: "30 to 39", min: 30, max: 39 },
    { key: "40-49", label: "40 to 49", min: 40, max: 49 },
    { key: "50+", label: "50 and up", min: 50, max: 999 }
  ];
  function ageGroup(age) {
    if (age === null || age === undefined || age === "" || isNaN(age)) return null;
    for (var i = 0; i < AGE_GROUPS.length; i++) if (age >= AGE_GROUPS[i].min && age <= AGE_GROUPS[i].max) return AGE_GROUPS[i];
    return null;
  }

  // Controller actions.
  function start() { return raceRef.set({ status: "running", startAt: firebase.database.ServerValue.TIMESTAMP, stopAt: null }); }
  function stop() { return raceRef.update({ status: "finished", stopAt: firebase.database.ServerValue.TIMESTAMP }); }
  function reset() { return raceRef.set({ status: "ready", startAt: null, stopAt: null }); }
  // Resume after a Stop: keep the elapsed time and keep counting from there.
  function resume() {
    var elapsed = elapsedMs();
    return raceRef.set({ status: "running", startAt: serverNow() - elapsed, stopAt: null });
  }
  // Correct the clock to an exact elapsed time (ms) and keep it running.
  function setElapsed(ms) {
    return raceRef.set({ status: "running", startAt: serverNow() - ms, stopAt: null });
  }
  // "4:30" or "1:04:30" or "270" (seconds) -> ms. Returns null if it can't read it.
  function parseTime(text) {
    var t = String(text || "").trim();
    if (!t) return null;
    var parts = t.split(":").map(function (p) { return p.trim(); });
    if (parts.some(function (p) { return p === "" || isNaN(p); })) return null;
    var nums = parts.map(Number);
    var secs = 0;
    if (nums.length === 1) secs = nums[0];
    else if (nums.length === 2) secs = nums[0] * 60 + nums[1];
    else if (nums.length === 3) secs = nums[0] * 3600 + nums[1] * 60 + nums[2];
    else return null;
    return Math.round(secs * 1000);
  }

  // Sign-in. Owner = emails in EAGLE_ADMINS. Staff = approved in /staff.
  var auth = firebase.auth();
  var provider = new firebase.auth.GoogleAuthProvider();
  var ADMINS = (window.EAGLE_ADMINS || []).map(function (a) { return a.toLowerCase(); });
  function signIn() { return auth.signInWithPopup(provider).catch(function () { return auth.signInWithRedirect(provider); }); }
  function signOut() { return auth.signOut(); }
  function onUser(cb) {
    var staffUnsub = null;
    auth.onAuthStateChanged(function (user) {
      if (staffUnsub) { staffUnsub(); staffUnsub = null; }
      if (!user) { cb({ user: null, email: "", isOwner: false, isStaff: false }); return; }
      var email = (user.email || "").toLowerCase();
      var isOwner = ADMINS.indexOf(email) !== -1;
      var ref = db.ref("staff/" + user.uid);
      var handler = function (snap) { cb({ user: user, email: email, isOwner: isOwner, isStaff: isOwner || snap.exists() }); };
      ref.on("value", handler, function () { cb({ user: user, email: email, isOwner: isOwner, isStaff: isOwner }); });
      staffUnsub = function () { ref.off("value", handler); };
    });
  }
  function requestAccess(user) { return db.ref("requests/" + user.uid).set({ email: user.email || "", at: firebase.database.ServerValue.TIMESTAMP }); }

  window.RaceClock = {
    db: db, serverNow: serverNow,
    onChange: function (fn) { listeners.push(fn); fn(state); },
    getState: function () { return state; },
    elapsedMs: elapsedMs, format: format, formatFull: formatFull,
    AGE_GROUPS: AGE_GROUPS, ageGroup: ageGroup,
    start: start, stop: stop, reset: reset, resume: resume, setElapsed: setElapsed, parseTime: parseTime,
    signIn: signIn, signOut: signOut, onUser: onUser, requestAccess: requestAccess
  };
})();
