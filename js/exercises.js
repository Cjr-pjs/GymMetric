/**
 * Built-in exercise database for GymMetric.
 * Provides a curated list of common exercises organized by muscle group.
 */

const EXERCISE_DATABASE = [
  // Chest
  { name: "Bench Press", category: "Chest", equipment: "Barbell", type: "strength" },
  { name: "Incline Bench Press", category: "Chest", equipment: "Barbell", type: "strength" },
  { name: "Decline Bench Press", category: "Chest", equipment: "Barbell", type: "strength" },
  { name: "Dumbbell Fly", category: "Chest", equipment: "Dumbbell", type: "strength" },
  { name: "Push-Up", category: "Chest", equipment: "Bodyweight", type: "strength" },
  { name: "Cable Crossover", category: "Chest", equipment: "Cable", type: "strength" },
  { name: "Chest Dip", category: "Chest", equipment: "Bodyweight", type: "strength" },

  // Back
  { name: "Deadlift", category: "Back", equipment: "Barbell", type: "strength" },
  { name: "Pull-Up", category: "Back", equipment: "Bodyweight", type: "strength" },
  { name: "Barbell Row", category: "Back", equipment: "Barbell", type: "strength" },
  { name: "Lat Pulldown", category: "Back", equipment: "Cable", type: "strength" },
  { name: "Seated Cable Row", category: "Back", equipment: "Cable", type: "strength" },
  { name: "Dumbbell Row", category: "Back", equipment: "Dumbbell", type: "strength" },
  { name: "T-Bar Row", category: "Back", equipment: "Barbell", type: "strength" },
  { name: "Face Pull", category: "Back", equipment: "Cable", type: "strength" },

  // Shoulders
  { name: "Overhead Press", category: "Shoulders", equipment: "Barbell", type: "strength" },
  { name: "Dumbbell Shoulder Press", category: "Shoulders", equipment: "Dumbbell", type: "strength" },
  { name: "Lateral Raise", category: "Shoulders", equipment: "Dumbbell", type: "strength" },
  { name: "Front Raise", category: "Shoulders", equipment: "Dumbbell", type: "strength" },
  { name: "Arnold Press", category: "Shoulders", equipment: "Dumbbell", type: "strength" },
  { name: "Upright Row", category: "Shoulders", equipment: "Barbell", type: "strength" },
  { name: "Shrug", category: "Shoulders", equipment: "Barbell", type: "strength" },

  // Arms
  { name: "Barbell Curl", category: "Arms", equipment: "Barbell", type: "strength" },
  { name: "Dumbbell Curl", category: "Arms", equipment: "Dumbbell", type: "strength" },
  { name: "Hammer Curl", category: "Arms", equipment: "Dumbbell", type: "strength" },
  { name: "Preacher Curl", category: "Arms", equipment: "Barbell", type: "strength" },
  { name: "Tricep Pushdown", category: "Arms", equipment: "Cable", type: "strength" },
  { name: "Skull Crusher", category: "Arms", equipment: "Barbell", type: "strength" },
  { name: "Overhead Tricep Extension", category: "Arms", equipment: "Dumbbell", type: "strength" },
  { name: "Dip", category: "Arms", equipment: "Bodyweight", type: "strength" },
  { name: "Close-Grip Bench Press", category: "Arms", equipment: "Barbell", type: "strength" },

  // Legs
  { name: "Squat", category: "Legs", equipment: "Barbell", type: "strength" },
  { name: "Front Squat", category: "Legs", equipment: "Barbell", type: "strength" },
  { name: "Leg Press", category: "Legs", equipment: "Machine", type: "strength" },
  { name: "Lunge", category: "Legs", equipment: "Dumbbell", type: "strength" },
  { name: "Romanian Deadlift", category: "Legs", equipment: "Barbell", type: "strength" },
  { name: "Leg Curl", category: "Legs", equipment: "Machine", type: "strength" },
  { name: "Leg Extension", category: "Legs", equipment: "Machine", type: "strength" },
  { name: "Calf Raise", category: "Legs", equipment: "Machine", type: "strength" },
  { name: "Hack Squat", category: "Legs", equipment: "Machine", type: "strength" },
  { name: "Bulgarian Split Squat", category: "Legs", equipment: "Dumbbell", type: "strength" },
  { name: "Goblet Squat", category: "Legs", equipment: "Dumbbell", type: "strength" },

  // Core
  { name: "Plank", category: "Core", equipment: "Bodyweight", type: "duration" },
  { name: "Crunch", category: "Core", equipment: "Bodyweight", type: "strength" },
  { name: "Sit-Up", category: "Core", equipment: "Bodyweight", type: "strength" },
  { name: "Leg Raise", category: "Core", equipment: "Bodyweight", type: "strength" },
  { name: "Russian Twist", category: "Core", equipment: "Bodyweight", type: "strength" },
  { name: "Ab Wheel Rollout", category: "Core", equipment: "Other", type: "strength" },
  { name: "Cable Crunch", category: "Core", equipment: "Cable", type: "strength" },
  { name: "Hanging Leg Raise", category: "Core", equipment: "Bodyweight", type: "strength" },

  // Cardio
  { name: "Running", category: "Cardio", equipment: "None", type: "cardio" },
  { name: "Cycling", category: "Cardio", equipment: "Machine", type: "cardio" },
  { name: "Rowing", category: "Cardio", equipment: "Machine", type: "cardio" },
  { name: "Jump Rope", category: "Cardio", equipment: "Other", type: "cardio" },
  { name: "Elliptical", category: "Cardio", equipment: "Machine", type: "cardio" },
  { name: "Swimming", category: "Cardio", equipment: "None", type: "cardio" },
  { name: "Stair Climber", category: "Cardio", equipment: "Machine", type: "cardio" },
  { name: "HIIT Sprint", category: "Cardio", equipment: "None", type: "cardio" },
];

const CATEGORIES = [...new Set(EXERCISE_DATABASE.map(e => e.category))];
const EQUIPMENT_TYPES = [...new Set(EXERCISE_DATABASE.map(e => e.equipment))];

/**
 * Returns exercises filtered by optional category and equipment filters.
 * @param {string|null} category
 * @param {string|null} equipment
 * @param {string} searchTerm
 * @returns {Array}
 */
function getExercises(category = null, equipment = null, searchTerm = "") {
  return EXERCISE_DATABASE.filter(ex => {
    const matchesCategory = !category || ex.category === category;
    const matchesEquipment = !equipment || ex.equipment === equipment;
    const matchesSearch = !searchTerm || ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesEquipment && matchesSearch;
  });
}
