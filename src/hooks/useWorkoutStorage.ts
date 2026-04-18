import { useCallback, useEffect, useState } from 'react';
import type { SavedWorkout } from '../types/workout';
import { createWorkout, deleteWorkout as deleteWorkoutRequest, fetchWorkouts, updateWorkout as updateWorkoutRequest } from '../services/api';

const STORAGE_KEY_PREFIX = 'gymmetric_workouts';

export type WorkoutPayload = {
  name: string;
  schedule: {
    time: string;
    weekDays: string[];
  };
  exercises: Array<{
    group: string;
    subcategory: string;
    name: string;
    sets: string;
    repsOrTime: string;
    rest: string;
  }>;
};

function createLocalWorkout(payload: WorkoutPayload): SavedWorkout {
  return {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: payload.exercises.map((exercise) => ({
      ...exercise,
      id: crypto.randomUUID()
    }))
  };
}

export function useWorkoutStorage(clientId: string) {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const storageKey = `${STORAGE_KEY_PREFIX}_${clientId}`;

  useEffect(() => {
    let mounted = true;

    const loadWorkouts = async () => {
      try {
        const remoteWorkouts = await fetchWorkouts(clientId);
        if (!mounted) {
          return;
        }

        setWorkouts(remoteWorkouts);
        localStorage.setItem(storageKey, JSON.stringify(remoteWorkouts));
      } catch (error) {
        console.error('Erro ao carregar treinos da API. Usando cache local:', error);

        if (!mounted) {
          return;
        }

        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            setWorkouts(JSON.parse(stored) as SavedWorkout[]);
          }
        } catch (storageError) {
          console.error('Erro ao ler treinos do storage:', storageError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadWorkouts();

    return () => {
      mounted = false;
    };
  }, [clientId, storageKey]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(storageKey, JSON.stringify(workouts));
    }
  }, [workouts, loading, storageKey]);

  const addWorkout = useCallback(async (workout: WorkoutPayload) => {
    try {
      const created = await createWorkout(clientId, workout);
      setWorkouts((prev) => [created, ...prev]);
      return created.id;
    } catch (error) {
      console.error('Erro ao salvar treino no banco. Salvando localmente:', error);
      const fallback = createLocalWorkout(workout);
      setWorkouts((prev) => [fallback, ...prev]);
      return fallback.id;
    }
  }, [clientId]);

  const updateWorkout = useCallback(async (id: string, workout: WorkoutPayload) => {
    try {
      const updated = await updateWorkoutRequest(clientId, id, workout);
      setWorkouts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return;
    } catch (error) {
      console.error('Erro ao atualizar treino no banco. Mantendo local:', error);
    }

    setWorkouts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: workout.name,
              schedule: workout.schedule,
              exercises: workout.exercises.map((exercise) => ({
                ...exercise,
                id: crypto.randomUUID()
              })),
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
  }, [clientId]);

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      await deleteWorkoutRequest(clientId, id);
    } catch (error) {
      console.error('Erro ao deletar treino no banco. Removendo localmente:', error);
    }

    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, [clientId]);

  const getWorkout = useCallback(
    (id: string) => {
      return workouts.find((w) => w.id === id);
    },
    [workouts]
  );

  return {
    workouts,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkout
  };
}
