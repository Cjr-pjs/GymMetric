import type { Exercise } from '../types/workout';

type ExerciseItemProps = {
  index: number;
  exercise: Exercise;
  canRemove: boolean;
  onChange: (id: string, field: keyof Omit<Exercise, 'id'>, value: string) => void;
  onRemove: (id: string) => void;
};

const labels: Record<keyof Omit<Exercise, 'id'>, string> = {
  name: 'Nome do exercicio',
  sets: 'Series',
  repsOrTime: 'Repeticoes ou tempo',
  rest: 'Descanso'
};

export function ExerciseItem({ index, exercise, canRemove, onChange, onRemove }: ExerciseItemProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyan-300">Exercicio {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(exercise.id)}
            className="rounded-xl border border-rose-600/60 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-700/20"
          >
            Remover
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(labels) as Array<keyof Omit<Exercise, 'id'>>).map((field) => (
          <label key={field}>
            <span className="mb-1 block text-xs text-slate-300">{labels[field]}</span>
            <input
              type="text"
              value={exercise[field]}
              onChange={(event) => onChange(exercise.id, field, event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
