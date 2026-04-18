import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { buildRecommendation } from '../data/recommendations';
import { type MuscleGroup, type MuscleMode, type WorkoutGoal } from '../data/exercises';
import { workoutTemplates } from '../data/workoutTemplates';
import type { Goal, Level, RecommendedPlan, SavedWorkout, WorkoutCreationMode, WorkoutFormData } from '../types/workout';
import { ExerciseSelector } from './ExerciseSelector';
import type { WorkoutPayload } from '../hooks/useWorkoutStorage';
import { Link } from 'react-router-dom';

type WorkoutFormProps = {
  initialRecommendation?: {
    goal: Goal;
    level: Level;
  };
  initialWorkout?: SavedWorkout;
  initialWorkoutMode: WorkoutCreationMode;
  onWorkoutSaved?: (workoutId: string) => void;
  onSaveWorkout?: (data: WorkoutPayload) => Promise<string>;
};

type ValidationErrors = {
  workoutName?: string;
  trainingTime?: string;
  weekDays?: string;
  exercises?: string;
};

type WorkoutExerciseRow = {
  id: string;
  group: MuscleGroup | '';
  subcategory: string;
  exercise: string;
  sets: string;
  repsOrTime: string;
  rest: string;
};

const weekDays = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo'
];

const goals: { value: Goal; label: string }[] = [
  { value: 'ganho-massa', label: 'Ganho de massa' },
  { value: 'forca', label: 'Forca' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'condicionamento', label: 'Condicionamento' },
  { value: 'resistencia', label: 'Resistencia' }
];

const levelMultipliers: Record<Level, number> = {
  iniciante: 0.8,
  intermediario: 1,
  avancado: 1.2
};

function createExerciseRow(partial?: Partial<WorkoutExerciseRow>): WorkoutExerciseRow {
  return {
    id: crypto.randomUUID(),
    group: partial?.group ?? '',
    subcategory: partial?.subcategory ?? '',
    exercise: partial?.exercise ?? '',
    sets: partial?.sets ?? '',
    repsOrTime: partial?.repsOrTime ?? '',
    rest: partial?.rest ?? ''
  };
}

function createRowsFromWorkout(workout?: SavedWorkout): WorkoutExerciseRow[] {
  if (!workout || workout.exercises.length === 0) {
    return [createExerciseRow()];
  }

  return workout.exercises.map((exercise) =>
    createExerciseRow({
      group: exercise.group as MuscleGroup | '',
      subcategory: exercise.subcategory,
      exercise: exercise.name,
      sets: exercise.sets,
      repsOrTime: exercise.repsOrTime,
      rest: exercise.rest
    })
  );
}

function createRowsFromTemplate(goal: Goal, level?: Level): WorkoutExerciseRow[] {
  const template = workoutTemplates[goal as WorkoutGoal];
  const multiplier = level ? levelMultipliers[level] : 1;

  return template.suggestedExercises.map((exercise) => {
    const setsNumber = Number(exercise.sets);
    const sets = Number.isNaN(setsNumber)
      ? exercise.sets
      : String(Math.max(1, Math.round(setsNumber * multiplier)));

    return createExerciseRow({
      group: exercise.group,
      subcategory: exercise.subcategory,
      exercise: exercise.name,
      sets,
      repsOrTime: exercise.repsOrTime,
      rest: exercise.rest
    });
  });
}

function mapWorkoutToFormData(workout?: SavedWorkout, plan?: RecommendedPlan): WorkoutFormData {
  if (workout) {
    return {
      workoutName: workout.name,
      trainingTime: workout.schedule.time,
      weekDays: [...workout.schedule.weekDays],
      exercises: []
    };
  }

  const template = plan ? workoutTemplates[plan.goal as WorkoutGoal] : undefined;

  return {
    workoutName: plan?.suggestedName ?? template?.title ?? '',
    trainingTime: '',
    weekDays: plan?.suggestedDays ?? template?.defaultDays ?? [],
    exercises: []
  };
}

function buildPayload(rows: WorkoutExerciseRow[], formData: WorkoutFormData) {
  return {
    name: formData.workoutName,
    schedule: {
      time: formData.trainingTime,
      weekDays: formData.weekDays
    },
    exercises: rows.map((row) => ({
      group: row.group,
      subcategory: row.subcategory,
      name: row.exercise,
      sets: row.sets,
      repsOrTime: row.repsOrTime,
      rest: row.rest
    }))
  };
}

export function WorkoutForm({ initialRecommendation, initialWorkout, initialWorkoutMode, onWorkoutSaved, onSaveWorkout }: WorkoutFormProps) {
  const initialPlan = useMemo(
    () =>
      initialRecommendation
        ? buildRecommendation(initialRecommendation.goal, initialRecommendation.level)
        : undefined,
    [initialRecommendation]
  );

  const [goalForTemplates, setGoalForTemplates] = useState<Goal>(
    initialRecommendation?.goal ?? 'ganho-massa'
  );
  const [formData, setFormData] = useState<WorkoutFormData>(() =>
    mapWorkoutToFormData(initialWorkout, initialPlan)
  );
  const [exerciseRows, setExerciseRows] = useState<WorkoutExerciseRow[]>(() =>
    initialWorkout
      ? createRowsFromWorkout(initialWorkout)
      : initialRecommendation
        ? createRowsFromTemplate(initialRecommendation.goal, initialRecommendation.level)
        : [createExerciseRow()]
  );
  const [mode, setMode] = useState<MuscleMode>('livre');
  const [workoutType, setWorkoutType] = useState<WorkoutCreationMode>(
    initialRecommendation ? 'predefinido' : initialWorkoutMode
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [savedPayload, setSavedPayload] = useState<Record<string, unknown> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isManualMode = workoutType === 'manual';

  const updateField = <K extends keyof WorkoutFormData>(field: K, value: WorkoutFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.weekDays.includes(day);
      return {
        ...prev,
        weekDays: exists ? prev.weekDays.filter((item) => item !== day) : [...prev.weekDays, day]
      };
    });
  };

  const addExercise = () => {
    setExerciseRows((prev) => [...prev, createExerciseRow()]);
  };

  const removeExercise = (id: string) => {
    setExerciseRows((prev) => prev.filter((exercise) => exercise.id !== id));
  };

  const updateExercise = (id: string, field: keyof Omit<WorkoutExerciseRow, 'id'>, value: string) => {
    setExerciseRows((prev) =>
      prev.map((exercise) => {
        if (exercise.id !== id) {
          return exercise;
        }

        if (field === 'group') {
          const nextGroup = value as MuscleGroup | '';
          if (isManualMode) {
            if (nextGroup === 'perna') {
              setMode('perna');
            } else if (nextGroup === 'costas' || nextGroup === 'peito') {
              setMode((current) => (current === 'perna' ? 'perna' : 'superiores'));
            }
          } else {
            setMode('livre');
          }

          return {
            ...exercise,
            group: nextGroup,
            subcategory: '',
            exercise: ''
          };
        }

        if (field === 'subcategory') {
          return {
            ...exercise,
            subcategory: value,
            exercise: ''
          };
        }

        if (field === 'exercise') {
          return {
            ...exercise,
            exercise: value
          };
        }

        return {
          ...exercise,
          [field]: value
        };
      })
    );
  };

  const applyTemplate = () => {
    const template = workoutTemplates[goalForTemplates as WorkoutGoal];
    setWorkoutType('predefinido');

    setFormData((prev) => ({
      ...prev,
      workoutName: template.title,
      weekDays: template.defaultDays
    }));

    setMode('livre');

    setExerciseRows(createRowsFromTemplate(goalForTemplates));
  };

  const resetExerciseMode = () => {
    setWorkoutType('manual');
    setMode('livre');
    setExerciseRows([createExerciseRow()]);
  };

  const validate = () => {
    const nextErrors: ValidationErrors = {};

    if (!formData.workoutName.trim()) {
      nextErrors.workoutName = 'Informe um nome para o treino.';
    }

    if (!formData.trainingTime.trim()) {
      nextErrors.trainingTime = 'Defina um horario de treino.';
    }

    if (formData.weekDays.length === 0) {
      nextErrors.weekDays = 'Selecione pelo menos um dia da semana.';
    }

    const hasMixedGroups =
      exerciseRows.some((row) => row.group === 'perna') &&
      exerciseRows.some((row) => row.group === 'costas' || row.group === 'peito');

    const hasInvalidExercise = exerciseRows.some(
      (exercise) =>
        !exercise.group ||
        !exercise.subcategory.trim() ||
        !exercise.exercise.trim() ||
        !exercise.sets.trim() ||
        !exercise.repsOrTime.trim() ||
        !exercise.rest.trim()
    );

    if (exerciseRows.length === 0 || hasInvalidExercise) {
      nextErrors.exercises = 'Preencha todos os campos dos exercicios.';
    }

    if (isManualMode && hasMixedGroups) {
      nextErrors.exercises = 'Nao e permitido misturar perna com costas/peito.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = buildPayload(exerciseRows, formData);

    if (onSaveWorkout) {
      try {
        setIsSaving(true);
        const workoutId = await onSaveWorkout(payload);
        setSavedPayload(payload);
        if (onWorkoutSaved) {
          onWorkoutSaved(workoutId);
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      setSavedPayload(payload);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 text-[#e6e6e6]">
      <header className="mb-8 rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
        <h1 className="text-center text-3xl font-semibold text-[#e6e6e6]">
          <Link to="/home" className="transition hover:text-[#cfd7ff]">
            GymMetric
          </Link>
        </h1>
        <p className="mt-2 text-center text-sm text-[#a3a3a3]">
          Monte sua rotina com exercicios estruturados, seletor por grupo muscular e integracao pronta para backend.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
          <h2 className="text-xl font-semibold text-[#e6e6e6]">Dados do treino</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm text-[#a3a3a3]">Nome do treino</span>
              <input
                type="text"
                value={formData.workoutName}
                onChange={(event) => updateField('workoutName', event.target.value)}
                className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
                placeholder="Ex: Treino A - Superior"
              />
              {errors.workoutName && <p className="mt-1 text-xs text-rose-600">{errors.workoutName}</p>}
            </label>

            <label>
              <span className="mb-1 block text-sm text-[#a3a3a3]">Horario de treino</span>
              <input
                type="time"
                value={formData.trainingTime}
                onChange={(event) => updateField('trainingTime', event.target.value)}
                className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
              />
              {errors.trainingTime && <p className="mt-1 text-xs text-rose-600">{errors.trainingTime}</p>}
            </label>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-[#a3a3a3]">Dias da semana</p>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const active = formData.weekDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      active
                        ? 'bg-cyan-600 text-white'
                        : 'border border-[#2f2f2f] bg-[#191919] text-[#a3a3a3] hover:border-[#5b7cff]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {errors.weekDays && <p className="mt-2 text-xs text-rose-600">{errors.weekDays}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#e6e6e6]">Exercicios</h2>
              <p className="text-sm text-[#a3a3a3]">Grupo muscular, subcategoria e exercicio selecionados por lista.</p>
              <p className="mt-2 inline-flex rounded-full border border-[#2f2f2f] bg-[#191919] px-3 py-1 text-xs font-medium text-[#d0d0d0]">
                Modo atual: {isManualMode ? 'Manual' : 'Treino pre-definido'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addExercise}
                className="rounded-xl border border-[#2f2f2f] bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-[#e6e6e6] transition hover:border-[#5b7cff] hover:bg-[#303030]"
              >
                Adicionar exercicio
              </button>
              <button
                type="button"
                onClick={resetExerciseMode}
                className="rounded-xl border border-[#2f2f2f] bg-[#191919] px-4 py-2 text-sm font-medium text-[#d0d0d0] transition hover:border-[#5b7cff]"
              >
                Reiniciar grupos
              </button>
            </div>
          </div>

          {isManualMode && mode !== 'livre' && (
            <div className="mt-4 rounded-xl border border-[#3b4f95] bg-[#1b2238] px-4 py-3 text-sm text-[#c7d5ff]">
              {mode === 'perna'
                ? 'Treino travado em PERNA. Costas e peito ficam bloqueados.'
                : 'Treino travado em SUPERIORES. Perna fica bloqueado.'}
            </div>
          )}

          <div className="mt-4 space-y-3">
            {exerciseRows.map((exercise, index) => (
              <div key={exercise.id} className="rounded-xl border border-[#2f2f2f] bg-[#2a2a2a] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#dbe4ff]">Exercicio {index + 1}</h3>
                  {exerciseRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="rounded-xl border border-[#4a2a2a] px-3 py-1 text-xs font-medium text-[#ffb4b4] transition hover:bg-[#3a2020]"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <ExerciseSelector
                  index={index}
                  selectedGroup={exercise.group}
                  selectedSubcategory={exercise.subcategory}
                  selectedExercise={exercise.exercise}
                  mode={mode}
                  enforceSplitRules={isManualMode}
                  onGroupChange={(group) => updateExercise(exercise.id, 'group', group)}
                  onSubcategoryChange={(subcategory) => updateExercise(exercise.id, 'subcategory', subcategory)}
                  onExerciseChange={(selectedExercise) => updateExercise(exercise.id, 'exercise', selectedExercise)}
                />

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <label>
                    <span className="mb-1 block text-xs text-[#a3a3a3]">Series</span>
                    <input
                      type="text"
                      value={exercise.sets}
                      onChange={(event) => updateExercise(exercise.id, 'sets', event.target.value)}
                      className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
                      placeholder="4"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-xs text-[#a3a3a3]">Repeticoes ou tempo</span>
                    <input
                      type="text"
                      value={exercise.repsOrTime}
                      onChange={(event) => updateExercise(exercise.id, 'repsOrTime', event.target.value)}
                      className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
                      placeholder="8-12 reps"
                    />
                  </label>

                  <label className="md:col-span-3">
                    <span className="mb-1 block text-xs text-[#a3a3a3]">Descanso</span>
                    <input
                      type="text"
                      value={exercise.rest}
                      onChange={(event) => updateExercise(exercise.id, 'rest', event.target.value)}
                      className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
                      placeholder="90s"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          {errors.exercises && <p className="mt-2 text-xs text-rose-600">{errors.exercises}</p>}
        </section>

        <section className="rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
          <h2 className="text-xl font-semibold text-[#e6e6e6]">Treinos pre-montados</h2>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            Estrutura pronta para personalizacao futura por objetivo, mantendo a base local.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={goalForTemplates}
              onChange={(event) => setGoalForTemplates(event.target.value as Goal)}
              className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
            >
              {goals.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyTemplate}
              className="rounded-xl bg-[#5b7cff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f8bff]"
            >
              Usar estrutura base
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#2f2f2f] bg-[#191919] p-4">
              <p className="text-xs uppercase tracking-wide text-[#8ea2ff]">Objetivo</p>
              <p className="mt-1 font-semibold text-[#e6e6e6]">{workoutTemplates[goalForTemplates].title}</p>
              <p className="mt-1 text-sm text-[#a3a3a3]">{workoutTemplates[goalForTemplates].description}</p>
            </div>
            <div className="rounded-xl border border-[#2f2f2f] bg-[#191919] p-4">
              <p className="text-xs uppercase tracking-wide text-[#8ea2ff]">Notas de estrutura</p>
              <ul className="mt-2 space-y-1 text-sm text-[#a3a3a3]">
                {workoutTemplates[goalForTemplates].notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#2f2f2f] bg-[#191919] p-4">
            <p className="text-xs uppercase tracking-wide text-[#8ea2ff]">Exercicios base</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {workoutTemplates[goalForTemplates].suggestedExercises.map((exercise) => (
                <div key={`${exercise.group}-${exercise.subcategory}-${exercise.name}`} className="rounded-xl border border-[#2f2f2f] bg-[#202020] p-3">
                  <p className="text-sm font-semibold text-[#e6e6e6]">{exercise.name}</p>
                  <p className="mt-1 text-xs capitalize text-[#a3a3a3]">
                    {exercise.group} • {exercise.subcategory}
                  </p>
                  <p className="mt-2 text-xs text-[#a3a3a3]">
                    {exercise.sets} series • {exercise.repsOrTime} • descanso {exercise.rest}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-[#5b7cff] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#6f8bff]"
        >
          {isSaving ? 'Salvando ficha...' : 'Salvar ficha'}
        </button>
      </form>

      {savedPayload && (
        <section className="mt-6 rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
          <h2 className="text-lg font-semibold text-[#e6e6e6]">Ficha salva com sucesso</h2>
          <p className="mt-1 text-sm text-[#a3a3a3]">Exemplo de payload pronto para enviar ao backend:</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-[#2f2f2f] bg-[#191919] p-4 text-xs text-[#cfd7ff]">
            {JSON.stringify(savedPayload, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
