import type { WorkoutGoal } from './exercises';

export type WorkoutTemplate = {
  goal: WorkoutGoal;
  title: string;
  description: string;
  split: 'superiores' | 'perna' | 'full';
  defaultDays: string[];
  notes: string[];
  suggestedExercises: Array<{
    group: 'costas' | 'peito' | 'perna';
    subcategory: string;
    name: string;
    sets: string;
    repsOrTime: string;
    rest: string;
  }>;
};

export const workoutTemplates: Record<WorkoutGoal, WorkoutTemplate> = {
  'ganho-massa': {
    goal: 'ganho-massa',
    title: 'Base de hipertrofia',
    description: 'Estrutura pronta para progressao de carga e volume.',
    split: 'superiores',
    defaultDays: ['segunda', 'quarta', 'sexta'],
    notes: ['priorizar compostos', 'ajustar volume por grupo', 'manter progressao semanal'],
    suggestedExercises: [
      { group: 'peito', subcategory: 'compostos', name: 'Supino reto (barra)', sets: '4', repsOrTime: '8-12 reps', rest: '90s' },
      { group: 'costas', subcategory: 'remadas', name: 'Remada curvada (barra)', sets: '4', repsOrTime: '8-12 reps', rest: '90s' },
      { group: 'perna', subcategory: 'quadriceps', name: 'Agachamento livre', sets: '4', repsOrTime: '8-10 reps', rest: '120s' }
    ]
  },
  forca: {
    goal: 'forca',
    title: 'Base de forca',
    description: 'Bloco pensado para baixas repeticoes e recuperacao maior.',
    split: 'superiores',
    defaultDays: ['segunda', 'quarta', 'sexta'],
    notes: ['cargas mais altas', 'descanso maior', 'foco em execucao'],
    suggestedExercises: [
      { group: 'costas', subcategory: 'puxadas', name: 'Barra fixa', sets: '5', repsOrTime: '3-5 reps', rest: '150s' },
      { group: 'peito', subcategory: 'compostos', name: 'Supino reto (barra)', sets: '5', repsOrTime: '3-5 reps', rest: '150s' },
      { group: 'perna', subcategory: 'posterior', name: 'Levantamento terra', sets: '5', repsOrTime: '3-5 reps', rest: '180s' }
    ]
  },
  emagrecimento: {
    goal: 'emagrecimento',
    title: 'Base metabolica',
    description: 'Estrutura voltada para densidade e gasto energetico.',
    split: 'superiores',
    defaultDays: ['segunda', 'terca', 'quinta', 'sabado'],
    notes: ['intervalos curtos', 'combinar com cardio', 'manter consistencia'],
    suggestedExercises: [
      { group: 'perna', subcategory: 'gluteos', name: 'Step-up', sets: '4', repsOrTime: '12 reps por perna', rest: '45s' },
      { group: 'peito', subcategory: 'extras', name: 'Flexão de braço', sets: '4', repsOrTime: '15 reps', rest: '45s' },
      { group: 'costas', subcategory: 'isoladores', name: 'Straight arm pulldown', sets: '4', repsOrTime: '15 reps', rest: '45s' }
    ]
  },
  condicionamento: {
    goal: 'condicionamento',
    title: 'Base funcional',
    description: 'Treino preparatorio para capacidade fisica geral.',
    split: 'superiores',
    defaultDays: ['terca', 'quinta', 'sabado'],
    notes: ['movimentos dinamicos', 'controle de fadiga', 'repeticao controlada'],
    suggestedExercises: [
      { group: 'perna', subcategory: 'quadriceps', name: 'Afundo (lunge)', sets: '3', repsOrTime: '12 reps por perna', rest: '60s' },
      { group: 'costas', subcategory: 'remadas', name: 'Remada no TRX', sets: '3', repsOrTime: '15 reps', rest: '45s' },
      { group: 'peito', subcategory: 'extras', name: 'Flexão inclinada', sets: '3', repsOrTime: '15 reps', rest: '45s' }
    ]
  },
  resistencia: {
    goal: 'resistencia',
    title: 'Base de resistencia',
    description: 'Estrutura para manter esforco por mais tempo.',
    split: 'superiores',
    defaultDays: ['segunda', 'quarta', 'sabado'],
    notes: ['volume constante', 'menos pausa', 'ritmo sustentado'],
    suggestedExercises: [
      { group: 'perna', subcategory: 'gluteos', name: 'Glute bridge', sets: '4', repsOrTime: '20 reps', rest: '30s' },
      { group: 'costas', subcategory: 'puxadas', name: 'Puxada alta aberta', sets: '4', repsOrTime: '15 reps', rest: '45s' },
      { group: 'peito', subcategory: 'extras', name: 'Flexão de braço', sets: '4', repsOrTime: '15 reps', rest: '45s' }
    ]
  }
};
