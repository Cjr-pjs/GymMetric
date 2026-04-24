import type { ExperienceLevel, Goal, Level, SavedWorkout, WorkoutCreationMode } from '../types/workout';
import type { WorkoutPayload } from '../hooks/useWorkoutStorage';

type ProfileResponse = {
  onboardingSeen: boolean;
  name: string | null;
  experienceLevel: ExperienceLevel | null;
  workoutMode: WorkoutCreationMode | null;
  recommendationGoal: Goal | null;
  recommendationLevel: Level | null;
};

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    let details = '';

    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as { error?: string; details?: string };
        const parts = [payload.error, payload.details].filter((value): value is string => Boolean(value));
        details = parts.join(' - ');
      } else {
        details = (await response.text()).trim();
      }
    } catch {
      // Ignora falha ao ler o corpo de erro e mantém mensagem padrão.
    }

    const suffix = details ? `: ${details}` : '';
    throw new Error(`Request failed with status ${response.status}${suffix}`);
  }

  return (await response.json()) as T;
}

export async function fetchProfile(clientId: string) {
  const data = await request<{ profile: ProfileResponse }>(`/api/profile?clientId=${encodeURIComponent(clientId)}`);
  return data.profile;
}

export async function saveProfile(params: {
  clientId: string;
  onboardingSeen: boolean;
  name?: string;
  experienceLevel?: ExperienceLevel;
  workoutMode?: WorkoutCreationMode;
  recommendation?: {
    goal: Goal;
    level: Level;
  };
}) {
  const data = await request<{ profile: ProfileResponse }>('/api/profile', {
    method: 'POST',
    body: JSON.stringify({
      clientId: params.clientId,
      onboardingSeen: params.onboardingSeen,
      name: params.name,
      experienceLevel: params.experienceLevel,
      workoutMode: params.workoutMode,
      recommendationGoal: params.recommendation?.goal,
      recommendationLevel: params.recommendation?.level
    })
  });

  return data.profile;
}

export async function fetchWorkouts(clientId: string) {
  const data = await request<{ workouts: SavedWorkout[] }>(`/api/workouts?clientId=${encodeURIComponent(clientId)}`);
  return data.workouts;
}

export async function createWorkout(clientId: string, payload: WorkoutPayload) {
  const data = await request<{ workout: SavedWorkout }>('/api/workouts', {
    method: 'POST',
    body: JSON.stringify({ clientId, payload })
  });

  return data.workout;
}

export async function updateWorkout(clientId: string, workoutId: string, payload: WorkoutPayload) {
  const data = await request<{ workout: SavedWorkout }>(`/api/workouts/${workoutId}`, {
    method: 'PUT',
    body: JSON.stringify({ clientId, payload })
  });

  return data.workout;
}

export async function deleteWorkout(clientId: string, workoutId: string) {
  await request<{ success: boolean }>(`/api/workouts/${workoutId}?clientId=${encodeURIComponent(clientId)}`, {
    method: 'DELETE'
  });
}
