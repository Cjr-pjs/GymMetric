/**
 * Workout and routine management logic for GymMetric.
 */

const WorkoutManager = {
  /**
   * Create a new routine object.
   * @param {string} name
   * @param {string} description
   * @param {Array} exercises  - array of exercise entries
   * @returns {Object} routine
   */
  createRoutine(name, description, exercises = []) {
    const routine = {
      id: Storage.generateId(),
      name: name.trim(),
      description: description.trim(),
      exercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Storage.upsertRoutine(routine);
  },

  /**
   * Update an existing routine.
   * @param {string} id
   * @param {Object} updates  - partial routine fields
   * @returns {Object|null} updated routine
   */
  updateRoutine(id, updates) {
    const routines = Storage.getRoutines();
    const routine = routines.find(r => r.id === id);
    if (!routine) return null;
    const updated = { ...routine, ...updates, id, updatedAt: new Date().toISOString() };
    return Storage.upsertRoutine(updated);
  },

  /** Delete a routine by id. */
  deleteRoutine(id) {
    Storage.deleteRoutine(id);
  },

  /** Get all routines. */
  getRoutines() {
    return Storage.getRoutines();
  },

  /** Get a specific routine by id. */
  getRoutine(id) {
    return Storage.getRoutines().find(r => r.id === id) || null;
  },

  /**
   * Create an exercise entry for a routine.
   * @param {string} name
   * @param {number} sets
   * @param {string} reps  - e.g. "8-12" or "10"
   * @param {number|null} weight
   * @param {string} notes
   * @returns {Object}
   */
  createExerciseEntry(name, sets, reps, weight = null, notes = "") {
    return {
      id: Storage.generateId(),
      name,
      sets: parseInt(sets, 10) || 3,
      reps,
      weight,
      notes,
    };
  },

  /**
   * Log a completed workout session.
   * @param {string} routineId  - id of the routine performed (or null for ad-hoc)
   * @param {string} routineName
   * @param {Array} completedExercises  - array of { name, sets: [{reps, weight}], notes }
   * @param {number} durationMinutes
   * @param {string} notes
   * @returns {Object} log entry
   */
  logWorkout(routineId, routineName, completedExercises, durationMinutes, notes = "") {
    const log = {
      id: Storage.generateId(),
      routineId,
      routineName,
      exercises: completedExercises,
      durationMinutes: parseInt(durationMinutes, 10) || 0,
      notes,
      date: new Date().toISOString(),
    };
    return Storage.addLog(log);
  },

  /** Get all workout logs, newest first. */
  getLogs() {
    return Storage.getLogs();
  },

  /** Delete a workout log entry. */
  deleteLog(id) {
    Storage.deleteLog(id);
  },

  /**
   * Compute basic statistics from workout logs.
   * @returns {Object} stats
   */
  getStats() {
    const logs = Storage.getLogs();
    if (logs.length === 0) {
      return { totalWorkouts: 0, totalDuration: 0, avgDuration: 0, thisWeek: 0 };
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const totalDuration = logs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const thisWeek = logs.filter(l => new Date(l.date) >= weekAgo).length;

    // Personal records: find heaviest weight per exercise
    const prMap = {};
    logs.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.weight && set.reps) {
            const key = ex.name;
            const volume = set.weight * set.reps;
            if (!prMap[key] || volume > prMap[key].volume) {
              prMap[key] = { weight: set.weight, reps: set.reps, volume, date: log.date };
            }
          }
        });
      });
    });

    return {
      totalWorkouts: logs.length,
      totalDuration,
      avgDuration: Math.round(totalDuration / logs.length),
      thisWeek,
      personalRecords: prMap,
    };
  },
};
