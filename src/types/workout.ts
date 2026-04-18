export type Goal =
  | 'ganho-massa'
  | 'emagrecimento'
  | 'resistencia'
  | 'forca'
  | 'condicionamento';

export type Level = 'iniciante' | 'intermediario' | 'avancado';

export type ExperienceLevel = 'nunca-treinei' | 'iniciante' | 'intermediario' | 'avancado';

export type WorkoutCreationMode = 'manual' | 'predefinido';

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  repsOrTime: string;
  rest: string;
};

export type WorkoutFormData = {
  workoutName: string;
  trainingTime: string;
  weekDays: string[];
  exercises: Exercise[];
};

export type RecommendedPlan = {
  goal: Goal;
  level: Level;
  suggestedName: string;
  suggestedDays: string[];
  suggestedExercises: Omit<Exercise, 'id'>[];
};

export type SavedWorkout = {
  id: string;
  name: string;
  schedule: {
    time: string;
    weekDays: string[];
  };
  exercises: Array<{
    id: string;
    group: string;
    subcategory: string;
    name: string;
    sets: string;
    repsOrTime: string;
    rest: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
