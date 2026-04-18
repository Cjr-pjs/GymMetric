import type { SavedWorkout } from '../types/workout';
import { Link } from 'react-router-dom';

type DashboardProps = {
  workouts: SavedWorkout[];
  onCreateNew: () => void;
  onViewWorkout: (id: string) => void;
  loading?: boolean;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function Dashboard({ workouts, onCreateNew, onViewWorkout, loading }: DashboardProps) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#a3a3a3]">Carregando treinos...</p>
      </div>
    );
  }

  const isEmpty = workouts.length === 0;

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h1 className="text-4xl font-bold text-[#e6e6e6]">
              <Link to="/home" className="transition hover:text-[#cfd7ff]">
                GymMetric
              </Link>
            </h1>
            <p className="mt-2 text-[#a3a3a3]">Seus treinos, organizados e prontos</p>
          </div>

          <button
            onClick={onCreateNew}
            className="rounded-xl bg-[#5b7cff] px-6 py-3 font-semibold text-white transition hover:bg-[#6f8bff]"
          >
            + Novo treino
          </button>
        </header>

        {isEmpty ? (
          <div className="rounded-2xl border-2 border-dashed border-[#2f2f2f] bg-[#202020] p-12 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-[#e6e6e6]">Comece seu treino</h2>
            <p className="mb-6 text-[#a3a3a3]">Voce ainda nao criou nenhum treino. Clique no botao acima para começar!</p>
            <button
              onClick={onCreateNew}
              className="rounded-xl bg-[#5b7cff] px-8 py-3 font-bold text-white transition hover:bg-[#6f8bff]"
            >
              Criar primeiro treino
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex flex-col rounded-xl border border-[#2f2f2f] bg-[#202020] p-6 shadow-sm transition hover:border-[#3a3a3a]"
              >
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-[#e6e6e6]">{workout.name}</h3>
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-[#b5b5b5]">
                      <span className="font-medium">{workout.exercises.length}</span> exercicio
                      {workout.exercises.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-[#8a8a8a]">Criado em {formatDate(workout.createdAt)}</p>
                  </div>

                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8a8a8a]">Dias</p>
                    <div className="flex flex-wrap gap-1">
                      {workout.schedule.weekDays.map((day) => (
                        <span
                          key={day}
                          className="rounded-full border border-[#2f2f2f] bg-[#2a2a2a] px-2 py-1 text-xs text-[#cfd7ff]"
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8a8a8a]">Grupos</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(workout.exercises.map((ex) => ex.group))).map((group) => (
                        <span
                          key={group}
                          className="rounded-full border border-[#2f2f2f] bg-[#191919] px-2 py-1 text-xs text-[#b8b8b8]"
                        >
                          {group || 'outro'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onViewWorkout(workout.id)}
                  className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-4 py-2 font-medium text-[#e6e6e6] transition hover:border-[#5b7cff] hover:bg-[#202632]"
                >
                  Exibir detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
