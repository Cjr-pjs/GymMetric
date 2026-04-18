import type { Goal, Level, SavedWorkout, WorkoutCreationMode } from '../types/workout';
import { WorkoutForm } from './WorkoutForm';
import type { WorkoutPayload } from '../hooks/useWorkoutStorage';

type WorkoutBuilderProps = {
  initialRecommendation?: {
    goal: Goal;
    level: Level;
  };
  initialWorkout?: SavedWorkout;
  initialWorkoutMode: WorkoutCreationMode;
  onWorkoutSaved?: (workoutId: string) => void;
  onSaveWorkout?: (data: WorkoutPayload) => Promise<string>;
};

export function WorkoutBuilder({ initialRecommendation, initialWorkout, initialWorkoutMode, onWorkoutSaved, onSaveWorkout }: WorkoutBuilderProps) {
  return (
    <WorkoutForm
      initialRecommendation={initialRecommendation}
      initialWorkout={initialWorkout}
      initialWorkoutMode={initialWorkoutMode}
      onWorkoutSaved={onWorkoutSaved}
      onSaveWorkout={onSaveWorkout}
    />
  );
}
