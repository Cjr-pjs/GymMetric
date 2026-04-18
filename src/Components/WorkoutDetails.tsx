import type { SavedWorkout } from '../types/workout';

type WorkoutDetailsProps = {
  workout: SavedWorkout;
  onBack: () => void;
  onHome: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function WorkoutDetails({ workout, onBack, onHome, onEdit, onDelete }: WorkoutDetailsProps) {
  const groupedExercises = workout.exercises.reduce(
    (groups, exercise) => {
      const key = exercise.group || 'outro';
      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(exercise);
      return groups;
    },
    {} as Record<string, typeof workout.exercises>
  );

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header com botões */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <button
            onClick={onBack}
            className="rounded-xl border border-[#2f2f2f] bg-[#191919] px-4 py-2 font-medium text-[#d0d0d0] transition hover:border-[#5b7cff]"
          >
            ← Voltar
          </button>

          <div className="flex gap-2">
            <button
              onClick={onHome}
              className="rounded-xl border border-[#2f2f2f] bg-[#191919] px-4 py-2 font-medium text-[#d0d0d0] transition hover:border-[#5b7cff]"
            >
              Home
            </button>
            <button
              onClick={onEdit}
              className="rounded-xl bg-[#5b7cff] px-4 py-2 font-medium text-white transition hover:bg-[#6f8bff]"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="rounded-xl border border-[#4a2a2a] px-4 py-2 font-medium text-[#ffb4b4] transition hover:bg-[#3a2020]"
            >
              Deletar
            </button>
          </div>
        </div>

        {/* Titulo e metadata */}
        <header className="mb-8 rounded-2xl border border-[#2f2f2f] bg-[#202020] p-8">
          <h1 className="text-4xl font-bold text-[#e6e6e6]">{workout.name}</h1>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[#a3a3a3]">Criado em</p>
              <p className="font-semibold text-[#e6e6e6]">{formatDate(workout.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-[#a3a3a3]">Ultimo treino às</p>
              <p className="font-semibold text-[#e6e6e6]">{workout.schedule.time || 'Nao definido'}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-[#a3a3a3]">Dias da semana</p>
            <div className="flex flex-wrap gap-2">
              {workout.schedule.weekDays.map((day) => (
                <span key={day} className="rounded-full border border-[#2f2f2f] bg-[#191919] px-3 py-1 text-sm font-medium text-[#cfd7ff]">
                  {day}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Exercicios por grupo */}
        <div className="space-y-8">
          {Object.entries(groupedExercises).map(([group, exercises]) => (
            <section key={group} className="rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
              <h2 className="mb-4 text-xl font-semibold capitalize text-[#e6e6e6]">{group}</h2>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="rounded-xl border border-[#2f2f2f] bg-[#191919] p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-semibold text-[#e6e6e6]">
                        {index + 1}. {exercise.name}
                      </h3>
                    </div>

                    <div className="mb-2 text-xs text-[#a3a3a3]">
                      {exercise.subcategory && <span>{exercise.subcategory}</span>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-[#2f2f2f] bg-[#202632] p-3">
                        <p className="text-xs font-medium text-[#a7b8ff]">Series</p>
                        <p className="text-lg font-bold text-[#e6e6e6]">{exercise.sets}</p>
                      </div>

                      <div className="rounded-lg border border-[#2f2f2f] bg-[#22222b] p-3">
                        <p className="text-xs font-medium text-[#bfc8ff]">Repeticoes / Tempo</p>
                        <p className="text-lg font-bold text-[#e6e6e6]">{exercise.repsOrTime}</p>
                      </div>

                      <div className="rounded-lg border border-[#2f2f2f] bg-[#2a2420] p-3">
                        <p className="text-xs font-medium text-[#e3c5a7]">Descanso</p>
                        <p className="text-lg font-bold text-[#e6e6e6]">{exercise.rest}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Resumo */}
        <div className="mt-8 rounded-2xl border border-[#2f2f2f] bg-[#202020] p-6">
          <h3 className="mb-4 font-semibold text-[#e6e6e6]">Resumo</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[#a3a3a3]">Total de exercicios</p>
              <p className="text-2xl font-bold text-[#8ea2ff]">{workout.exercises.length}</p>
            </div>
            <div>
              <p className="text-sm text-[#a3a3a3]">Grupos musculares</p>
              <p className="text-2xl font-bold text-[#8ea2ff]">{Object.keys(groupedExercises).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
