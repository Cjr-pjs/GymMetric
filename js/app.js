/**
 * GymMetric - Main application controller.
 * Handles UI rendering and user interactions.
 */

// ─── State ───────────────────────────────────────────────────────────────────

const State = {
  currentView: "dashboard",
  editingRoutineId: null,
  activeWorkout: null,       // in-progress workout session
  activeWorkoutStart: null,  // Date when session started
  timerInterval: null,
};

// ─── Utility ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(minutes) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function el(id) { return document.getElementById(id); }

function showToast(message, type = "success") {
  const container = el("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("toast--visible"), 10);
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

function confirm(message) {
  return window.confirm(message);
}

// ─── Navigation ──────────────────────────────────────────────────────────────

function navigate(view) {
  State.currentView = view;
  document.querySelectorAll(".nav__link").forEach(link => {
    link.classList.toggle("nav__link--active", link.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach(v => {
    v.classList.toggle("view--active", v.id === `view-${view}`);
  });
  renderView(view);
}

function renderView(view) {
  switch (view) {
    case "dashboard":  renderDashboard();  break;
    case "routines":   renderRoutines();   break;
    case "log":        renderLog();        break;
    case "exercises":  renderExercises();  break;
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function renderDashboard() {
  const stats = WorkoutManager.getStats();
  const logs  = WorkoutManager.getLogs().slice(0, 5);

  el("stat-total").textContent  = stats.totalWorkouts;
  el("stat-week").textContent   = stats.thisWeek;
  el("stat-avg").textContent    = formatDuration(stats.avgDuration);

  // Recent workouts
  const recentEl = el("recent-workouts");
  if (logs.length === 0) {
    recentEl.innerHTML = `<p class="empty-state">No workouts logged yet. Start a workout to track your progress!</p>`;
    return;
  }
  recentEl.innerHTML = logs.map(log => `
    <div class="workout-card">
      <div class="workout-card__header">
        <span class="workout-card__name">${escapeHtml(log.routineName)}</span>
        <span class="workout-card__date">${formatDate(log.date)}</span>
      </div>
      <div class="workout-card__meta">
        <span>⏱ ${formatDuration(log.durationMinutes)}</span>
        <span>🏋 ${log.exercises.length} exercise${log.exercises.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  `).join("");
}

// ─── Routines ────────────────────────────────────────────────────────────────

function renderRoutines() {
  const routines = WorkoutManager.getRoutines();
  const list = el("routines-list");

  if (routines.length === 0) {
    list.innerHTML = `<p class="empty-state">No routines yet. Create your first routine to get started!</p>`;
    return;
  }
  list.innerHTML = routines.map(r => `
    <div class="routine-card" id="routine-${r.id}">
      <div class="routine-card__header">
        <h3 class="routine-card__name">${escapeHtml(r.name)}</h3>
        <div class="routine-card__actions">
          <button class="btn btn--primary btn--sm" onclick="startWorkout('${r.id}')">▶ Start</button>
          <button class="btn btn--outline btn--sm" onclick="openEditRoutine('${r.id}')">✏ Edit</button>
          <button class="btn btn--danger btn--sm" onclick="deleteRoutine('${r.id}')">🗑</button>
        </div>
      </div>
      ${r.description ? `<p class="routine-card__desc">${escapeHtml(r.description)}</p>` : ""}
      <ul class="exercise-list">
        ${r.exercises.map(ex => `
          <li class="exercise-list__item">
            <span class="exercise-list__name">${escapeHtml(ex.name)}</span>
            <span class="exercise-list__detail">${ex.sets} × ${escapeHtml(ex.reps)}${ex.weight ? " @ " + ex.weight + " lbs" : ""}</span>
          </li>
        `).join("")}
      </ul>
    </div>
  `).join("");
}

function openNewRoutine() {
  State.editingRoutineId = null;
  el("routine-modal-title").textContent = "New Routine";
  el("routine-name").value = "";
  el("routine-description").value = "";
  el("routine-exercises").innerHTML = "";
  el("routine-modal").classList.add("modal--open");
}

function openEditRoutine(id) {
  const routine = WorkoutManager.getRoutine(id);
  if (!routine) return;
  State.editingRoutineId = id;
  el("routine-modal-title").textContent = "Edit Routine";
  el("routine-name").value = routine.name;
  el("routine-description").value = routine.description;
  el("routine-exercises").innerHTML = "";
  routine.exercises.forEach(ex => addExerciseRow(ex));
  el("routine-modal").classList.add("modal--open");
}

function closeRoutineModal() {
  el("routine-modal").classList.remove("modal--open");
  State.editingRoutineId = null;
}

function addExerciseRow(ex = null) {
  const container = el("routine-exercises");
  const row = document.createElement("div");
  row.className = "exercise-row";
  row.dataset.id = ex ? ex.id : Storage.generateId();
  row.innerHTML = `
    <input class="input exercise-row__name" type="text" placeholder="Exercise name"
           value="${ex ? escapeAttr(ex.name) : ""}" list="exercise-suggestions" autocomplete="off" />
    <input class="input exercise-row__sets" type="number" placeholder="Sets" min="1" max="20"
           value="${ex ? ex.sets : "3"}" />
    <input class="input exercise-row__reps" type="text" placeholder="Reps (e.g. 8-12)"
           value="${ex ? escapeAttr(ex.reps) : "10"}" />
    <input class="input exercise-row__weight" type="number" placeholder="Weight (lbs)" min="0"
           value="${ex && ex.weight != null ? ex.weight : ""}" />
    <button class="btn btn--danger btn--sm btn--icon" onclick="removeExerciseRow(this)" title="Remove">✕</button>
  `;
  container.appendChild(row);
}

function removeExerciseRow(btn) {
  btn.closest(".exercise-row").remove();
}

function saveRoutine() {
  const name = el("routine-name").value.trim();
  if (!name) { showToast("Routine name is required.", "error"); return; }

  const rows = document.querySelectorAll(".exercise-row");
  const exercises = [];
  for (const row of rows) {
    const eName = row.querySelector(".exercise-row__name").value.trim();
    if (!eName) continue;
    exercises.push({
      id: row.dataset.id,
      name: eName,
      sets: parseInt(row.querySelector(".exercise-row__sets").value, 10) || 3,
      reps: row.querySelector(".exercise-row__reps").value.trim() || "10",
      weight: parseFloat(row.querySelector(".exercise-row__weight").value) || null,
      notes: "",
    });
  }

  if (State.editingRoutineId) {
    WorkoutManager.updateRoutine(State.editingRoutineId, {
      name,
      description: el("routine-description").value.trim(),
      exercises,
    });
    showToast("Routine updated!");
  } else {
    WorkoutManager.createRoutine(name, el("routine-description").value.trim(), exercises);
    showToast("Routine created!");
  }

  closeRoutineModal();
  renderRoutines();
}

function deleteRoutine(id) {
  if (!confirm("Delete this routine?")) return;
  WorkoutManager.deleteRoutine(id);
  showToast("Routine deleted.");
  renderRoutines();
}

// ─── Active Workout ───────────────────────────────────────────────────────────

function startWorkout(routineId) {
  const routine = WorkoutManager.getRoutine(routineId);
  if (!routine) return;

  State.activeWorkout = {
    routineId: routine.id,
    routineName: routine.name,
    exercises: routine.exercises.map(ex => ({
      name: ex.name,
      targetSets: ex.sets,
      targetReps: ex.reps,
      sets: [],
      notes: "",
    })),
    notes: "",
  };
  State.activeWorkoutStart = new Date();
  renderActiveWorkout();
  el("active-workout-overlay").classList.add("overlay--open");
  startTimer();
}

function startTimer() {
  if (State.timerInterval) clearInterval(State.timerInterval);
  State.timerInterval = setInterval(() => {
    if (!State.activeWorkoutStart) return;
    const elapsed = Math.floor((Date.now() - State.activeWorkoutStart) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const s = (elapsed % 60).toString().padStart(2, "0");
    const timerEl = el("workout-timer");
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function renderActiveWorkout() {
  const w = State.activeWorkout;
  if (!w) return;

  el("active-workout-title").textContent = w.routineName;

  const content = el("active-workout-exercises");
  content.innerHTML = w.exercises.map((ex, exIdx) => `
    <div class="active-exercise" id="active-ex-${exIdx}">
      <div class="active-exercise__header">
        <h4 class="active-exercise__name">${escapeHtml(ex.name)}</h4>
        <span class="active-exercise__target">Target: ${ex.targetSets} × ${escapeHtml(ex.targetReps)}</span>
      </div>
      <div class="sets-log" id="sets-${exIdx}">
        ${ex.sets.map((set, sIdx) => `
          <div class="set-row set-row--logged">
            <span class="set-row__num">Set ${sIdx + 1}</span>
            <span class="set-row__reps">${set.reps} reps</span>
            <span class="set-row__weight">${set.weight ? set.weight + " lbs" : "bodyweight"}</span>
            <button class="btn btn--danger btn--icon btn--xs" onclick="removeSet(${exIdx}, ${sIdx})" title="Remove">✕</button>
          </div>
        `).join("")}
      </div>
      <div class="set-input-row">
        <input class="input input--sm" type="number" placeholder="Reps" id="reps-${exIdx}" min="1" value="${ex.targetReps.split('-')[0]}" />
        <input class="input input--sm" type="number" placeholder="Weight (lbs)" id="weight-${exIdx}" min="0" />
        <button class="btn btn--primary btn--sm" onclick="logSet(${exIdx})">+ Log Set</button>
      </div>
      <textarea class="input input--sm exercise-notes" placeholder="Notes..." id="ex-notes-${exIdx}" rows="1">${escapeHtml(ex.notes)}</textarea>
    </div>
  `).join("");
}

function logSet(exIdx) {
  const reps   = parseInt(el(`reps-${exIdx}`).value, 10);
  const weight = parseFloat(el(`weight-${exIdx}`).value) || null;
  if (!reps || reps < 1) { showToast("Please enter a valid rep count.", "error"); return; }

  // Save notes
  const notesEl = el(`ex-notes-${exIdx}`);
  if (notesEl) State.activeWorkout.exercises[exIdx].notes = notesEl.value;

  State.activeWorkout.exercises[exIdx].sets.push({ reps, weight });
  renderActiveWorkout();
}

function removeSet(exIdx, setIdx) {
  State.activeWorkout.exercises[exIdx].sets.splice(setIdx, 1);
  renderActiveWorkout();
}

function finishWorkout() {
  const w = State.activeWorkout;
  if (!w) return;

  // Capture final notes from DOM
  w.exercises.forEach((ex, i) => {
    const notesEl = el(`ex-notes-${i}`);
    if (notesEl) ex.notes = notesEl.value;
  });

  const hasData = w.exercises.some(ex => ex.sets.length > 0);
  if (!hasData) {
    if (!confirm("You haven't logged any sets. Save the workout anyway?")) return;
  }

  const durationMinutes = State.activeWorkoutStart
    ? Math.round((Date.now() - State.activeWorkoutStart) / 60000)
    : 0;

  WorkoutManager.logWorkout(
    w.routineId,
    w.routineName,
    w.exercises,
    durationMinutes,
    w.notes
  );

  clearInterval(State.timerInterval);
  State.activeWorkout = null;
  State.activeWorkoutStart = null;
  el("active-workout-overlay").classList.remove("overlay--open");

  showToast("Workout saved! Great job! 💪");
  renderDashboard();
  if (State.currentView === "log") renderLog();
}

function cancelWorkout() {
  if (!confirm("Discard this workout session?")) return;
  clearInterval(State.timerInterval);
  State.activeWorkout = null;
  State.activeWorkoutStart = null;
  el("active-workout-overlay").classList.remove("overlay--open");
}

// ─── Log ─────────────────────────────────────────────────────────────────────

function renderLog() {
  const logs = WorkoutManager.getLogs();
  const container = el("log-list");

  if (logs.length === 0) {
    container.innerHTML = `<p class="empty-state">No workouts logged yet. Complete a workout to see your history!</p>`;
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="log-card">
      <div class="log-card__header">
        <div>
          <h3 class="log-card__name">${escapeHtml(log.routineName)}</h3>
          <span class="log-card__date">${formatDate(log.date)}</span>
        </div>
        <div class="log-card__meta">
          <span>⏱ ${formatDuration(log.durationMinutes)}</span>
          <button class="btn btn--danger btn--sm" onclick="deleteLog('${log.id}')">🗑</button>
        </div>
      </div>
      <div class="log-card__exercises">
        ${log.exercises.map(ex => `
          <div class="log-exercise">
            <span class="log-exercise__name">${escapeHtml(ex.name)}</span>
            <span class="log-exercise__sets">${ex.sets.map(s => `${s.reps}${s.weight ? "@" + s.weight : ""}`).join(", ")}</span>
          </div>
        `).join("")}
      </div>
      ${log.notes ? `<p class="log-card__notes">${escapeHtml(log.notes)}</p>` : ""}
    </div>
  `).join("");
}

function deleteLog(id) {
  if (!confirm("Delete this log entry?")) return;
  WorkoutManager.deleteLog(id);
  showToast("Log entry deleted.");
  renderLog();
  if (State.currentView === "dashboard") renderDashboard();
}

// ─── Exercise Browser ─────────────────────────────────────────────────────────

function renderExercises() {
  const categoryFilter  = el("exercise-category-filter").value;
  const equipmentFilter = el("exercise-equipment-filter").value;
  const search          = el("exercise-search").value;

  const exercises = getExercises(categoryFilter || null, equipmentFilter || null, search);
  const container = el("exercise-grid");

  if (exercises.length === 0) {
    container.innerHTML = `<p class="empty-state">No exercises match your filters.</p>`;
    return;
  }

  container.innerHTML = exercises.map(ex => `
    <div class="exercise-card">
      <div class="exercise-card__name">${escapeHtml(ex.name)}</div>
      <div class="exercise-card__tags">
        <span class="tag tag--category">${escapeHtml(ex.category)}</span>
        <span class="tag tag--equipment">${escapeHtml(ex.equipment)}</span>
        <span class="tag tag--type">${escapeHtml(ex.type)}</span>
      </div>
    </div>
  `).join("");
}

function initExerciseFilters() {
  const catSelect = el("exercise-category-filter");
  const eqSelect  = el("exercise-equipment-filter");

  CATEGORIES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    catSelect.appendChild(opt);
  });

  EQUIPMENT_TYPES.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e; opt.textContent = e;
    eqSelect.appendChild(opt);
  });

  catSelect.addEventListener("change", renderExercises);
  eqSelect.addEventListener("change", renderExercises);
  el("exercise-search").addEventListener("input", renderExercises);
}

// ─── Security helpers ─────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── Initialisation ───────────────────────────────────────────────────────────

function init() {
  // Wire up nav links
  document.querySelectorAll(".nav__link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.view);
    });
  });

  // Populate exercise name suggestions datalist
  const datalist = el("exercise-suggestions");
  EXERCISE_DATABASE.forEach(ex => {
    const opt = document.createElement("option");
    opt.value = ex.name;
    datalist.appendChild(opt);
  });

  initExerciseFilters();
  navigate("dashboard");
}

document.addEventListener("DOMContentLoaded", init);
