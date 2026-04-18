import { useMemo, useState } from 'react';
import type { ExperienceLevel, Goal, Level, WorkoutCreationMode } from '../types/workout';
import { buildRecommendation } from '../data/recommendations';

type OnboardingResult = {
  experienceLevel: ExperienceLevel;
  workoutMode: WorkoutCreationMode;
  recommendation?: {
    goal: Goal;
    level: Level;
  };
};

type OnboardingModalProps = {
  open: boolean;
  isSubmitting?: boolean;
  onComplete: (result: OnboardingResult) => Promise<void> | void;
};

const goals: { value: Goal; label: string }[] = [
  { value: 'ganho-massa', label: 'Ganho de massa' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'resistencia', label: 'Resistencia' },
  { value: 'forca', label: 'Forca' },
  { value: 'condicionamento', label: 'Condicionamento' }
];

const levels: { value: Level; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediario' },
  { value: 'avancado', label: 'Avancado' }
];

const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'nunca-treinei', label: 'Nunca treinei' },
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediario' },
  { value: 'avancado', label: 'Avancado' }
];

function mapExperienceToLevel(experience: ExperienceLevel): Level {
  if (experience === 'intermediario' || experience === 'avancado') {
    return experience;
  }

  return 'iniciante';
}

export function OnboardingModal({ open, isSubmitting = false, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<'experience' | 'mode' | 'profile'>('experience');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('iniciante');
  const [goal, setGoal] = useState<Goal>('ganho-massa');
  const level = mapExperienceToLevel(experienceLevel);

  const preview = useMemo(() => buildRecommendation(goal, level), [goal, level]);

  if (!open) {
    return null;
  }

  const currentStep = step === 'experience' ? 1 : step === 'mode' ? 2 : 3;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(53,116,96,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(126,155,132,0.18),transparent_38%),linear-gradient(180deg,#090b0a,#111513_60%,#0b0d0c)] p-4 sm:p-8">
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center py-8">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#2f3733] bg-[#111513]/95 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur md:grid-cols-[1.05fr_1.35fr]">
          <aside className="relative border-b border-[#2a322e] bg-[linear-gradient(170deg,#121917_0%,#0f1311_62%,#0b0d0c_100%)] p-7 md:border-b-0 md:border-r md:p-8">
            <div className="absolute -right-8.5 -top-8.5 h-28 w-28 rounded-full bg-[#78b596]/12 blur-3xl" />
            <p className="inline-flex rounded-full border border-[#314037] bg-[#17231d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#9dc4af]">
              Primeiro acesso
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#eef2ef]">
              Monte sua ficha ideal
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a7b1ab]">
              Configure seu perfil inicial para receber sugestões mais inteligentes e entrar direto no dashboard.
            </p>

            <div className="mt-7 space-y-3">
              {[1, 2, 3].map((item) => {
                const active = currentStep === item;
                const done = currentStep > item;

                return (
                  <div key={item} className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${active ? 'border-[#3f5e4f] bg-[#1a2520]' : 'border-[#2a322e] bg-[#121816]'}`}>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-[#6aa889] text-[#062015]' : active ? 'bg-[#2f4539] text-[#d5e5dc]' : 'bg-[#1d2521] text-[#7f8c85]'}`}
                    >
                      {done ? 'ok' : item}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#7f8c85]">Etapa {item}</p>
                      <p className="text-sm font-medium text-[#dde3df]">
                        {item === 1 ? 'Experiencia' : item === 2 ? 'Modo de montagem' : 'Ajustes finais'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="p-6 sm:p-8">
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#1a221e]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#5f9e81,#7ec09e)] transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {step === 'experience' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7c8a82]">Seu nivel</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[#eef2ef]">Qual sua experiencia com treino?</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {experienceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setExperienceLevel(option.value);
                        setStep('mode');
                      }}
                      className="rounded-2xl border border-[#2d3732] bg-[#151d19] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#4d6f5f] hover:bg-[#1a2520]"
                    >
                      <p className="font-semibold text-[#e8eeea]">{option.label}</p>
                      <p className="mt-1 text-xs text-[#8b9690]">Usaremos isso para calibrar sugestoes e volume.</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'mode' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7c8a82]">Formato</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[#eef2ef]">Como voce quer montar sua ficha?</h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep('profile')}
                    className="rounded-2xl border border-[#446b59] bg-[linear-gradient(145deg,#20362d,#1a2c24)] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#5a8f77]"
                  >
                    <p className="font-semibold text-[#edf4f0]">Receber treinos prontos</p>
                    <p className="mt-1 text-xs text-[#b8c8c0]">Sugestoes automaticamente baseadas no seu perfil.</p>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      void onComplete({
                        experienceLevel,
                        workoutMode: 'manual'
                      })
                    }
                    className="rounded-2xl border border-[#2d3732] bg-[#141b17] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#486154] hover:bg-[#19211d]"
                  >
                    <p className="font-semibold text-[#edf4f0]">Montar tudo manualmente</p>
                    <p className="mt-1 text-xs text-[#a6b1ab]">Voce escolhe cada exercicio e configuracao da rotina.</p>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep('experience')}
                  className="text-sm font-medium text-[#8a958f] transition hover:text-[#dde3df]"
                >
                  Voltar
                </button>
              </div>
            )}

            {step === 'profile' && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7c8a82]">Personalizacao</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[#eef2ef]">Ajuste seu objetivo inicial</h3>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#c7d0cb]">Objetivo principal</label>
                  <select
                    value={goal}
                    onChange={(event) => setGoal(event.target.value as Goal)}
                    className="w-full rounded-2xl border border-[#2d3732] bg-[#131915] px-3 py-3 text-[#e8eeea] outline-none transition focus:border-[#6ea98c]"
                  >
                    {goals.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#c7d0cb]">Nivel detectado pela experiencia</label>
                  <p className="rounded-2xl border border-[#2d3732] bg-[#121814] px-3 py-3 text-sm text-[#e8eeea]">
                    {levels.find((item) => item.value === level)?.label}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#2d3732] bg-[#121814] p-4">
                  <p className="text-sm font-medium text-[#b8c3bd]">Previa da recomendacao</p>
                  <p className="mt-1 text-lg font-semibold text-[#ebf1ed]">{preview.suggestedName}</p>
                  <p className="mt-2 text-sm text-[#9ea9a3]">Dias sugeridos: {preview.suggestedDays.join(', ')}</p>
                  <p className="mt-1 text-sm text-[#9ea9a3]">
                    Exercicios base: {preview.suggestedExercises.map((exercise) => exercise.name).join(', ')}
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep('mode')}
                    className="rounded-xl border border-[#2d3732] bg-[#161d19] px-4 py-3 font-medium text-[#d2dbd6] transition hover:border-[#4a5b52]"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      void onComplete({
                        experienceLevel,
                        workoutMode: 'predefinido',
                        recommendation: { goal, level }
                      })
                    }
                    className="rounded-xl bg-[linear-gradient(135deg,#5a9d80,#74b495)] px-4 py-3 font-semibold text-[#092115] transition hover:brightness-110"
                  >
                    {isSubmitting ? 'Salvando perfil...' : 'Continuar com treinos prontos'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-[#212925] pt-4">
              <p className="text-xs text-[#73807a]">
                Seus dados iniciais sao usados para personalizar o app e salvos de forma persistente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { OnboardingResult };
