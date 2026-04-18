import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { OnboardingModal, type OnboardingResult } from './Components/OnboardingModal';
import { Dashboard } from './Components/Dashboard';
import { WorkoutBuilder } from './Components/WorkoutBuilder';
import { WorkoutDetails } from './Components/WorkoutDetails';
import { useWorkoutStorage, type WorkoutPayload } from './hooks/useWorkoutStorage';
import { getOrCreateClientId } from './lib/clientIdentity';
import { fetchProfile, saveProfile } from './services/api';
import type { Goal, Level, WorkoutCreationMode } from './types/workout';

const ONBOARDING_STORAGE_KEY = 'gymmetric_onboarding_seen';

function isWorkoutMode(value: string | null): value is WorkoutCreationMode {
  return value === 'manual' || value === 'predefinido';
}

function isGoal(value: string | null): value is Goal {
  return value === 'ganho-massa' || value === 'emagrecimento' || value === 'resistencia' || value === 'forca' || value === 'condicionamento';
}

function isLevel(value: string | null): value is Level {
  return value === 'iniciante' || value === 'intermediario' || value === 'avancado';
}

function App() {
  const navigate = useNavigate();
  const [clientId] = useState(() => getOrCreateClientId());
  const { workouts, loading, addWorkout, updateWorkout, deleteWorkout, getWorkout } = useWorkoutStorage(clientId);
  const [profileLoading, setProfileLoading] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [recommendation, setRecommendation] = useState<{ goal: Goal; level: Level } | undefined>();
  const [workoutMode, setWorkoutMode] = useState<WorkoutCreationMode>('manual');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await fetchProfile(clientId);
        if (!active) {
          return;
        }

        const seen = profile.onboardingSeen;
        setOnboardingSeen(seen);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, seen ? 'true' : 'false');

        if (isWorkoutMode(profile.workoutMode)) {
          setWorkoutMode(profile.workoutMode);
        }

        if (isGoal(profile.recommendationGoal) && isLevel(profile.recommendationLevel)) {
          setRecommendation({
            goal: profile.recommendationGoal,
            level: profile.recommendationLevel
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil no banco. Usando fallback local:', error);

        if (!active) {
          return;
        }

        const localSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
        setOnboardingSeen(localSeen);
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [clientId]);

  const handleOnboardingComplete = async (result: OnboardingResult) => {
    setWorkoutMode(result.workoutMode);
    setRecommendation(result.recommendation);
    setOnboardingSeen(true);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');

    try {
      setSavingOnboarding(true);
      await saveProfile({
        clientId,
        onboardingSeen: true,
        experienceLevel: result.experienceLevel,
        workoutMode: result.workoutMode,
        recommendation: result.recommendation
      });
    } catch (error) {
      console.error('Erro ao salvar onboarding no banco:', error);
    } finally {
      setSavingOnboarding(false);
      navigate(result.workoutMode === 'predefinido' ? '/editar-treino' : '/home', { replace: true });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101110] text-[#d1d6d2]">
        <p className="text-sm tracking-wide">Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={onboardingSeen ? '/home' : '/onboarding'} replace />} />
      <Route
        path="/onboarding"
        element={
          onboardingSeen ? (
            <Navigate to="/home" replace />
          ) : (
            <OnboardingModal open onComplete={handleOnboardingComplete} isSubmitting={savingOnboarding} />
          )
        }
      />
      <Route
        path="/home"
        element={
          onboardingSeen ? <HomeRoute workouts={workouts} loading={loading} /> : <Navigate to="/onboarding" replace />
        }
      />
      <Route
        path="/editar-treino"
        element={
          onboardingSeen ? (
            <WorkoutEditorRoute
              recommendation={recommendation}
              workoutMode={workoutMode}
              addWorkout={addWorkout}
              updateWorkout={updateWorkout}
              getWorkout={getWorkout}
            />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />
      <Route
        path="/editar-treino/:id"
        element={
          onboardingSeen ? (
            <WorkoutEditorRoute
              recommendation={recommendation}
              workoutMode={workoutMode}
              addWorkout={addWorkout}
              updateWorkout={updateWorkout}
              getWorkout={getWorkout}
            />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />
      <Route
        path="/treinos/:id"
        element={
          onboardingSeen ? (
            <WorkoutDetailsRoute deleteWorkout={deleteWorkout} getWorkout={getWorkout} />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={onboardingSeen ? '/home' : '/onboarding'} replace />} />
    </Routes>
  );
}

function HomeRoute({ workouts, loading }: { workouts: ReturnType<typeof useWorkoutStorage>['workouts']; loading: boolean }) {
  const navigate = useNavigate();

  return (
    <Dashboard
      workouts={workouts}
      loading={loading}
      onCreateNew={() => navigate('/editar-treino')}
      onViewWorkout={(id) => navigate(`/treinos/${id}`)}
    />
  );
}

function WorkoutEditorRoute({
  recommendation,
  workoutMode,
  addWorkout,
  updateWorkout,
  getWorkout
}: {
  recommendation: { goal: Goal; level: Level } | undefined;
  workoutMode: WorkoutCreationMode;
  addWorkout: ReturnType<typeof useWorkoutStorage>['addWorkout'];
  updateWorkout: ReturnType<typeof useWorkoutStorage>['updateWorkout'];
  getWorkout: ReturnType<typeof useWorkoutStorage>['getWorkout'];
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const existingWorkout = id ? getWorkout(id) : undefined;

  if (id && !existingWorkout) {
    return <Navigate to="/home" replace />;
  }

  return (
    <WorkoutBuilder
      key={`${existingWorkout?.id ?? 'new'}-${workoutMode}`}
      initialRecommendation={existingWorkout ? undefined : recommendation}
      initialWorkout={existingWorkout}
      initialWorkoutMode={workoutMode}
      onSaveWorkout={async (payload: WorkoutPayload) => {
        if (existingWorkout) {
          await updateWorkout(existingWorkout.id, payload);
          return existingWorkout.id;
        }

        return await addWorkout(payload);
      }}
      onWorkoutSaved={(workoutId) => navigate(`/treinos/${workoutId}`)}
    />
  );
}

function WorkoutDetailsRoute({
  deleteWorkout,
  getWorkout
}: {
  deleteWorkout: ReturnType<typeof useWorkoutStorage>['deleteWorkout'];
  getWorkout: ReturnType<typeof useWorkoutStorage>['getWorkout'];
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const workout = id ? getWorkout(id) : undefined;

  if (!workout) {
    return <Navigate to="/home" replace />;
  }

  return (
    <WorkoutDetails
      workout={workout}
      onBack={() => navigate(-1)}
      onHome={() => navigate('/home')}
      onEdit={() => navigate(`/editar-treino/${workout.id}`)}
      onDelete={() => {
        if (window.confirm('Tem certeza que deseja deletar este treino?')) {
          void deleteWorkout(workout.id).finally(() => {
            navigate('/home', { replace: true });
          });
        }
      }}
    />
  );
}

export default App;