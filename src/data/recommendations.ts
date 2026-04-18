import type { Goal, Level, RecommendedPlan } from '../types/workout';

const baseByGoal: Record<Goal, Omit<RecommendedPlan, 'level'>> = {
  'ganho-massa': {
    goal: 'ganho-massa',
    suggestedName: 'Hipertrofia Progressiva',
    suggestedDays: ['segunda', 'quarta', 'sexta'],
    suggestedExercises: [
      {
        name: 'Supino reto',
        sets: '4',
        repsOrTime: '8-12 reps',
        rest: '90s'
      },
      {
        name: 'Agachamento livre',
        sets: '4',
        repsOrTime: '8-10 reps',
        rest: '120s'
      },
      {
        name: 'Remada curvada',
        sets: '3',
        repsOrTime: '10-12 reps',
        rest: '90s'
      }
    ]
  },
  emagrecimento: {
    goal: 'emagrecimento',
    suggestedName: 'Definicao Ativa',
    suggestedDays: ['segunda', 'terca', 'quinta', 'sabado'],
    suggestedExercises: [
      {
        name: 'Esteira HIIT',
        sets: '6',
        repsOrTime: '40s forte / 20s leve',
        rest: '60s'
      },
      {
        name: 'Afundo alternado',
        sets: '3',
        repsOrTime: '12 reps por perna',
        rest: '60s'
      },
      {
        name: 'Burpee',
        sets: '4',
        repsOrTime: '12 reps',
        rest: '45s'
      }
    ]
  },
  resistencia: {
    goal: 'resistencia',
    suggestedName: 'Resistencia Total',
    suggestedDays: ['segunda', 'quarta', 'quinta', 'sabado'],
    suggestedExercises: [
      {
        name: 'Corrida leve',
        sets: '1',
        repsOrTime: '30 minutos',
        rest: '---'
      },
      {
        name: 'Prancha',
        sets: '4',
        repsOrTime: '45s',
        rest: '30s'
      },
      {
        name: 'Kettlebell swing',
        sets: '4',
        repsOrTime: '20 reps',
        rest: '60s'
      }
    ]
  },
  forca: {
    goal: 'forca',
    suggestedName: 'Forca Bruta',
    suggestedDays: ['segunda', 'quarta', 'sexta'],
    suggestedExercises: [
      {
        name: 'Levantamento terra',
        sets: '5',
        repsOrTime: '3-5 reps',
        rest: '150s'
      },
      {
        name: 'Barra fixa',
        sets: '5',
        repsOrTime: '6-8 reps',
        rest: '120s'
      },
      {
        name: 'Desenvolvimento militar',
        sets: '4',
        repsOrTime: '5-8 reps',
        rest: '120s'
      }
    ]
  },
  condicionamento: {
    goal: 'condicionamento',
    suggestedName: 'Cardio Funcional',
    suggestedDays: ['terca', 'quinta', 'sabado'],
    suggestedExercises: [
      {
        name: 'Bicicleta ergometrica',
        sets: '1',
        repsOrTime: '25 minutos',
        rest: '---'
      },
      {
        name: 'Polichinelo',
        sets: '5',
        repsOrTime: '1 minuto',
        rest: '30s'
      },
      {
        name: 'Abdominal bicicleta',
        sets: '4',
        repsOrTime: '20 reps',
        rest: '45s'
      }
    ]
  }
};

const levelMultiplier: Record<Level, number> = {
  iniciante: 0.8,
  intermediario: 1,
  avancado: 1.2
};

export function buildRecommendation(goal: Goal, level: Level): RecommendedPlan {
  const base = baseByGoal[goal];

  const adjustedExercises = base.suggestedExercises.map((exercise) => {
    const setsNumber = Number(exercise.sets);
    if (Number.isNaN(setsNumber)) {
      return exercise;
    }

    const scaledSets = Math.max(1, Math.round(setsNumber * levelMultiplier[level]));
    return {
      ...exercise,
      sets: String(scaledSets)
    };
  });

  return {
    goal,
    level,
    suggestedName: `${base.suggestedName} - ${level}`,
    suggestedDays: base.suggestedDays,
    suggestedExercises: adjustedExercises
  };
}
