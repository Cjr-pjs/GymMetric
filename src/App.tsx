import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { LoginModal, type LoginResult } from './Components/LoginModal';
import { Dashboard } from './Components/Dashboard';
import { WorkoutBuilder } from './Components/WorkoutBuilder';
import { WorkoutDetails } from './Components/WorkoutDetails';
import { useWorkoutStorage, type WorkoutPayload } from './hooks/useWorkoutStorage';
import { getOrCreateClientId } from './lib/clientIdentity';
import { fetchProfile, saveProfile } from './services/api';
import type { Goal, Level, WorkoutCreationMode } from './types/workout';

const ONBOARDING_STORAGE_KEY = 'gymmetric_onboarding_seen';
const USER_NAME_STORAGE_KEY = 'gymmetric_user_name';

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
  const [userName, setUserName] = useState('');
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [recommendation, setRecommendation] = useState<{ goal: Goal; level: Level } | undefined>();
  const [workoutMode, setWorkoutMode] = useState<WorkoutCreationMode>('manual');
  const displayName = userName.trim();
  const profileReady = onboardingSeen && Boolean(displayName);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await fetchProfile(clientId);
        if (!active) {
          return;
        }

        const seen = profile.onboardingSeen;
        const name = profile.name?.trim() ?? '';
        const ready = seen && Boolean(name);
        setOnboardingSeen(ready);
        setUserName(name);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, ready ? 'true' : 'false');
        localStorage.setItem(USER_NAME_STORAGE_KEY, name);

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

        const localName = localStorage.getItem(USER_NAME_STORAGE_KEY)?.trim() ?? '';
        const localSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true' && Boolean(localName);
        setOnboardingSeen(localSeen);
        setUserName(localName);
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

  const handleOnboardingComplete = async (result: LoginResult) => {
    setOnboardingSeen(true);
    setUserName(result.name);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.setItem(USER_NAME_STORAGE_KEY, result.name);

    try {
      setSavingOnboarding(true);
      await saveProfile({
        clientId,
        onboardingSeen: true,
        name: result.name
      });
    } catch (error) {
      console.error('Erro ao salvar onboarding no banco:', error);
    } finally {
      setSavingOnboarding(false);
      navigate('/home', { replace: true });
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
    <>
      {profileReady ? <UserBadge name={displayName} /> : null}
      <Routes>
        <Route path="/" element={<Navigate to={profileReady ? '/home' : '/onboarding'} replace />} />
        <Route
          path="/onboarding"
          element={
            profileReady ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginModal open onComplete={handleOnboardingComplete} isSubmitting={savingOnboarding} />
            )
          }
        />
        <Route
          path="/home"
          element={profileReady ? <HomeRoute workouts={workouts} loading={loading} /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/editar-treino"
          element={
            profileReady ? (
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
            profileReady ? (
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
            profileReady ? (
              <WorkoutDetailsRoute deleteWorkout={deleteWorkout} getWorkout={getWorkout} />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={profileReady ? '/home' : '/onboarding'} replace />} />
      </Routes>
    </>
  );
}

function UserBadge({ name }: { name: string }) {
  return (
    <div className="fixed right-4 top-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-[#2b3530] bg-[#111513]/90 px-4 py-2 text-[#eaf0ed] shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur md:right-6 md:top-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f3029] text-[#7ec09e]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 3.134-8 7v1h16v-1c0-3.866-3.582-7-8-7Z" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8e9a95]">Conta</p>
        <p className="truncate text-sm font-semibold text-[#edf2ef]">{name}</p>
      </div>
    </div>
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