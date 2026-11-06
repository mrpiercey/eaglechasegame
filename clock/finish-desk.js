// The finish-desk logic shared by finish.html and tap.html: recording bibs, the
// finisher list, editing a finish in place, undo, and helper sign-in.
// Options:
//   results    list fastest first with places, instead of newest first
//   onRunners  called when the runner list changes
//   onChange   called after every redraw of the list
window.FinishDesk = function (opts) {
  var $ = function (id) { return document.getElementById(id); };
  var db = RaceClock.db;
  var mainEl = $("main"), tenthsEl = $("tenths"), clockEl = $("clock");
  var lastMain = "", lastTenths = "";
  var runners = {}, finishes = {}, me = null, lastRecorded = null;
  var editing = null, deleteArmed = false, editError = "";

  function paint() {
    var f = RaceClock.format(RaceClock.elapsedMs());
    if (f.main !== lastMain) { mainEl.textContent = f.main; lastMain = f.main; }
    if (f.tenths !== lastTenths) { tenthsEl.textContent = f.tenths; lastTenths = f.tenths; }
    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
  RaceClock.onChange(function (s) { clockEl.classList.toggle("finished", s.status === "finished"); });

  db.ref("runners").on("value", function (snap) { runners = snap.val() || {}; if (opts.onRunners) opts.onRunners(); render(); });
  db.ref("finishes").on("value", function (snap) { finishes = snap.val() || {}; render(); });

  function runnerName(bib) {
    var r = runners[bib];
    if (!r) return "Unknown bib";
    return ((r.first || "") + " " + (r.last || "")).trim() || "Unknown name";
  }
  function groupLabel(bib) {
    var r = runners[bib]; if (!r) return "";
    var g = RaceClock.ageGroup(Number(r.age));
    return [r.gender === "M" ? "Male" : r.gender === "F" ? "Female" : "", g ? g.label : ""].filter(Boolean).join(", ");
  }

  // Finish rows redraw on every database update, so an open editor keeps what was typed.
  function readDraft() {
    var bibEl = $("editBib"), timeEl = $("editTime");
    if (!bibEl) return null;
    var active = document.activeElement;
    var focused = active === bibEl || active === timeEl ? active.id : null;
    return { bib: bibEl.value, time: timeEl.value, focused: focused, start: focused ? active.selectionStart : 0, end: focused ? active.selectionEnd : 0 };
  }

  function placeHtml(place) { return opts.results ? '<span class="fplace">' + place + '</span>' : ""; }

  function editorRow(f, draft, place) {
    var li = document.createElement("li");
    li.className = "editing";
    // Same columns as a normal row, so each box opens right where its value was.
    var bib = String(f.bib), group = groupLabel(bib);
    li.innerHTML = placeHtml(place) + '<form class="editForm" id="editForm">' +
      '<input id="editBib" class="timeInput" type="text" inputmode="numeric" autocomplete="off" aria-label="Bib number">' +
      '<input id="editTime" class="timeInput" type="text" autocomplete="off" placeholder="mm:ss.t" aria-label="Finish time">' +
      '<button class="btn quiet tiny" type="submit">Save</button>' +
      '<div class="editMid"><span class="fname">' + escapeHtml(runnerName(bib)) +
        '<small class="warnText" id="editMsg" hidden></small><small><span class="editGroup">' + escapeHtml(group) + '</span>' +
        (deleteArmed ? '' : '<button class="editDeleteLink" type="button" data-act="delete">Delete</button>') + '</small></span>' +
        // Yes sits across the row from the Delete link, so a double click can't delete.
        (deleteArmed
          ? '<button class="btn quiet tiny" type="button" data-act="delete-no">Keep it</button>' +
            '<button class="btn quiet tiny editDelete" type="button" data-act="delete-yes">Yes, delete</button>'
          : '<button class="btn quiet tiny" type="button" data-act="cancel">Cancel</button>') +
        '</div></form>';
    li.querySelector("#editBib").value = draft ? draft.bib : f.bib;
    li.querySelector("#editTime").value = draft ? draft.time : RaceClock.formatFull(f.elapsed);
    var msg = li.querySelector("#editMsg");
    msg.textContent = editError; msg.hidden = !editError;
    return li;
  }

  function render() {
    var draft = readDraft();
    if (editing && !finishes[editing]) { editing = null; deleteArmed = false; editError = ""; draft = null; }
    var list = $("list"); list.innerHTML = "";
    var all = Object.keys(finishes).map(function (k) { return finishes[k]; }).sort(function (a, b) { return b.at - a.at; });
    var newest = all.length ? String(all[0].bib) : null;
    if (opts.results) all.sort(function (a, b) { return a.elapsed - b.elapsed || a.at - b.at; });
    $("count").textContent = all.length ? "(" + all.length + " total)" : "";
    $("empty").hidden = all.length > 0;
    $("undoBtn").hidden = !(lastRecorded && finishes[lastRecorded]);
    all.forEach(function (f, i) {
      if (String(f.bib) === editing) { list.appendChild(editorRow(f, draft, i + 1)); return; }
      var li = document.createElement("li");
      li.setAttribute("data-bib", f.bib);
      if (String(f.bib) === newest) li.className = "newest";
      var name = runnerName(String(f.bib)), group = groupLabel(String(f.bib));
      li.innerHTML = placeHtml(i + 1) + '<span class="fbib">#' + f.bib + '</span><span class="fname">' + escapeHtml(name) +
        (group ? '<small>' + escapeHtml(group) + '</small>' : '<small class="warnText">Not on the runner list</small>') +
        '</span><span class="ftime">' + RaceClock.formatFull(f.elapsed) + '</span>' +
        '<button class="btn quiet tiny" type="button" data-act="edit">Edit</button>';
      list.appendChild(li);
    });
    if (editing && draft && draft.focused) {
      var el = $(draft.focused);
      if (el) { el.focus({ preventScroll: true }); el.setSelectionRange(draft.start, draft.end); }
    }
    if (opts.onChange) opts.onChange();
  }

  function openEditor(bib) {
    editing = String(bib); deleteArmed = false; editError = "";
    var open = $("editForm"); if (open) open.closest("li").remove();   // don't carry one row's draft into another
    render();
    var t = $("editTime"); if (t) { t.focus({ preventScroll: true }); t.select(); }
  }
  function closeEditor() {
    editing = null; deleteArmed = false; editError = "";
    var open = $("editForm"); if (open) open.closest("li").remove();
    render();
    $("bib").focus({ preventScroll: true });   // stay on this spot in the list
  }
  function editFail(text) {
    editError = text;
    var msg = $("editMsg"); if (msg) { msg.textContent = text; msg.hidden = false; }
  }

  function saveEdit() {
    var oldBib = editing, f = finishes[oldBib];
    if (!f) { closeEditor(); return; }
    var newBib = $("editBib").value.replace(/\D/g, "");
    var timeText = $("editTime").value.trim();
    if (!newBib) { editFail("Type a bib number."); return; }
    // Leave the exact stored time alone unless it was actually changed.
    var elapsed = timeText === RaceClock.formatFull(f.elapsed) ? f.elapsed : RaceClock.parseTime(timeText);
    if (elapsed === null || elapsed < 0) { editFail("Type the time like 3:23.7 or 1:02:15.4."); return; }
    if (newBib !== oldBib && finishes[newBib]) { editFail("Bib " + newBib + " (" + runnerName(newBib) + ") already finished at " + RaceClock.formatFull(finishes[newBib].elapsed) + "."); return; }
    var entry = {}; Object.keys(f).forEach(function (k) { entry[k] = f[k]; });
    entry.bib = newBib; entry.elapsed = elapsed;
    var updates = {}; updates[newBib] = entry;
    if (newBib !== oldBib) updates[oldBib] = null;
    db.ref("finishes").update(updates).then(function () {
      if (lastRecorded === oldBib) lastRecorded = newBib;
      say("Saved #" + newBib + " " + runnerName(newBib) + " at " + RaceClock.formatFull(elapsed), "ok");
      closeEditor();
    }).catch(function (err) { editFail("Could not save: " + (err && err.message ? err.message : "no permission")); });
  }

  function deleteEdit() {
    var bib = editing;
    db.ref("finishes/" + bib).remove().then(function () {
      if (lastRecorded === bib) lastRecorded = null;
      say("Removed #" + bib + ".", "ok");
      closeEditor();
    }).catch(function (err) { editFail("Could not delete: " + (err && err.message ? err.message : "no permission")); });
  }

  $("list").addEventListener("click", function (e) {
    var act = e.target.closest("[data-act]"), action = act ? act.getAttribute("data-act") : "";
    if (action === "cancel") { closeEditor(); return; }
    if (action === "delete") {
      deleteArmed = true; render();
      var keep = document.querySelector("[data-act=delete-no]"); if (keep) keep.focus({ preventScroll: true });
      return;
    }
    if (action === "delete-no") {
      deleteArmed = false; render();
      var t = $("editTime"); if (t) t.focus({ preventScroll: true });
      return;
    }
    if (action === "delete-yes") { deleteEdit(); return; }
    if (e.target.closest("#editForm")) return;
    var row = e.target.closest("li[data-bib]");
    if (!row) return;
    if (action !== "edit" && String(window.getSelection())) return;   // dragging to select text isn't a click on the row
    openEditor(row.getAttribute("data-bib"));
  });
  $("list").addEventListener("submit", function (e) { e.preventDefault(); saveEdit(); });
  $("list").addEventListener("keydown", function (e) { if (e.key === "Escape" && editing) closeEditor(); });

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function say(text, kind) { var m = $("msg"); m.textContent = text; m.className = "note " + (kind || "warn"); m.hidden = !text; }

  function record(bib, elapsed) {
    if (!bib) return;
    if (RaceClock.getState().status !== "running") { say("The race clock is not running, so there is no time to record yet."); return; }
    if (finishes[bib]) { say("Bib " + bib + " (" + runnerName(bib) + ") already finished at " + RaceClock.formatFull(finishes[bib].elapsed) + ". Not recorded again."); return; }
    var entry = { bib: bib, elapsed: elapsed, at: firebase.database.ServerValue.TIMESTAMP, by: me ? me.email : "" };
    // A transaction so two helpers entering the same bib can't overwrite the first time.
    db.ref("finishes/" + bib).transaction(function (current) {
      return current === null ? entry : undefined;
    }).then(function (result) {
      if (!result.committed) { say("Bib " + bib + " (" + runnerName(bib) + ") was already recorded by another helper."); return; }
      lastRecorded = bib;
      say("#" + bib + " " + runnerName(bib) + " at " + RaceClock.formatFull(elapsed), "ok");
      render();
      if (opts.results && !editing) {
        var row = $("list").querySelector('li[data-bib="' + bib + '"]');
        if (row) row.scrollIntoView({ block: "nearest" });
      }
    }).catch(function (err) { say("Could not save: " + (err && err.message ? err.message : "no permission")); });
  }

  $("bibForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var elapsed = RaceClock.elapsedMs();       // grab the time first, before anything else
    var bib = $("bib").value.replace(/\D/g, "");
    $("bib").value = ""; $("bib").focus();
    record(bib, elapsed);
  });

  $("undoBtn").addEventListener("click", function () {
    if (!lastRecorded) return;
    var bib = lastRecorded;
    db.ref("finishes/" + bib).remove().then(function () { say("Removed #" + bib + ". Type it again when they cross.", "ok"); lastRecorded = null; render(); $("bib").focus(); });
  });

  $("signInBtn").addEventListener("click", function () { RaceClock.signIn(); });
  function signOut(e) { if (e) e.preventDefault(); RaceClock.signOut(); }
  $("signOutBtn").addEventListener("click", signOut);
  $("signOutBtn2").addEventListener("click", signOut);
  $("askBtn").addEventListener("click", function () { if (me && me.user) RaceClock.requestAccess(me.user).then(function () { $("askMsg").hidden = false; }); });

  RaceClock.onUser(function (u) {
    me = u;
    $("signedOut").hidden = !!u.user;
    $("waiting").hidden = !u.user || u.isStaff;
    $("panel").hidden = !u.isStaff;
    $("who").textContent = u.email;
    $("whoEmail").textContent = u.email;
    if (u.isStaff) setTimeout(function () { $("bib").focus(); }, 50);
  });

  return {
    record: record,
    runnerName: runnerName,
    runners: function () { return runners; },
    finishes: function () { return finishes; }
  };
};
