/**
 * Storage layer for GymMetric.
 * Manages all data persistence via localStorage.
 */

const STORAGE_KEYS = {
  ROUTINES: "gymmetric_routines",
  WORKOUT_LOGS: "gymmetric_logs",
  SETTINGS: "gymmetric_settings",
};

const Storage = {
  /** Retrieve all saved routines. */
  getRoutines() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROUTINES) || "[]");
  },

  /** Save routines array. */
  saveRoutines(routines) {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  },

  /** Add or update a routine by id. */
  upsertRoutine(routine) {
    const routines = this.getRoutines();
    const idx = routines.findIndex(r => r.id === routine.id);
    if (idx >= 0) {
      routines[idx] = routine;
    } else {
      routines.push(routine);
    }
    this.saveRoutines(routines);
    return routine;
  },

  /** Delete a routine by id. */
  deleteRoutine(id) {
    const routines = this.getRoutines().filter(r => r.id !== id);
    this.saveRoutines(routines);
  },

  /** Retrieve all workout log entries. */
  getLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS) || "[]");
  },

  /** Save workout logs array. */
  saveLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
  },

  /** Add a completed workout log entry. */
  addLog(log) {
    const logs = this.getLogs();
    logs.unshift(log);
    this.saveLogs(logs);
    return log;
  },

  /** Delete a log entry by id. */
  deleteLog(id) {
    const logs = this.getLogs().filter(l => l.id !== id);
    this.saveLogs(logs);
  },

  /** Get app settings. */
  getSettings() {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SETTINGS) ||
        JSON.stringify({ weightUnit: "lbs", theme: "light" })
    );
  },

  /** Save app settings. */
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  /** Generate a unique ID. */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
};
