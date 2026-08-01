export const exercises = {
  costas: {
    puxadas: [
      'Pulldown (puxada na frente)',
      'Puxada alta aberta',
      'Puxada alta fechada',
      'Puxada supinada',
      'Barra fixa',
      'Barra fixa assistida',
      'Puxada com corda'
    ],
    remadas: [
      'Remada baixa (cabo)',
      'Remada curvada (barra)',
      'Remada curvada (halter)',
      'Remada unilateral (halter)',
      'Remada cavalinho (T-bar)',
      'Remada máquina (articulada)',
      'Remada no TRX'
    ],
    isoladores: [
      'Pullover (cabo ou halter)',
      'Pullover máquina',
      'Straight arm pulldown',
      'Encolhimento (trapézio)'
    ]
  },

  peito: {
    compostos: [
      'Supino reto (barra)',
      'Supino reto (halter)',
      'Supino inclinado (barra)',
      'Supino inclinado (halter)',
      'Supino declinado',
      'Supino máquina',
      'Chest press (máquina)'
    ],
    isoladores: [
      'Crossover (cabo)',
      'Crucifixo (halter)',
      'Crucifixo máquina (peck deck)',
      'Crossover polia baixa',
      'Crossover polia alta'
    ],
    extras: [
      'Flexão de braço',
      'Flexão inclinada',
      'Flexão declinada'
    ]
  },

  perna: {
    quadriceps: [
      'Agachamento livre',
      'Agachamento no Smith',
      'Leg press',
      'Hack machine',
      'Cadeira extensora',
      'Afundo (lunge)',
      'Passada andando'
    ],
    posterior: [
      'Mesa flexora',
      'Cadeira flexora',
      'Stiff (barra ou halter)',
      'Levantamento terra',
      'Good morning'
    ],
    gluteos: [
      'Elevação pélvica (hip thrust)',
      'Glute bridge',
      'Coice no cabo',
      'Abdução de quadril (máquina)',
      'Step-up'
    ],
    panturrilha: [
      'Panturrilha em pé',
      'Panturrilha sentado',
      'Panturrilha no leg press'
    ]
  },

  bracos: {
    biceps: [
      'Rosca Direta (Barra Reta ou Barra W)',
      'Rosca Alternada com Halteres',
      'Rosca Inclinada com Halteres (Banco 45°)',
      'Rosca Scott',
      'Rosca Martelo'
    ],
    triceps: [
      'Tríceps Testa',
      'Tríceps Pulley (Barra Reta ou V)',
      'Tríceps Corda',
      'Tríceps Francês',
      'Mergulho nas Paralelas'
    ],
    ombros: [
      'Desenvolvimento com Halteres',
      'Desenvolvimento com Barra',
      'Desenvolvimento na Máquina',
      'Elevação Lateral com Halteres',
      'Elevação Lateral na Polia',
      'Crucifixo Invertido (Halteres ou Peck Deck)',
      'Face Pull'
    ]
  }
} as const;

export type MuscleGroup = keyof typeof exercises;
export type MuscleMode = 'livre' | 'superiores' | 'perna';
export type WorkoutGoal = 'ganho-massa' | 'forca' | 'emagrecimento' | 'condicionamento' | 'resistencia';

export type ExerciseCategory = keyof typeof exercises.costas | keyof typeof exercises.peito | keyof typeof exercises.perna | keyof typeof exercises.bracos;

export const exerciseGroupLabels: Record<MuscleGroup, string> = {
  costas: 'Costas',
  peito: 'Peito',
  perna: 'Perna',
  bracos: 'Braços'
};

export const exerciseCatalog = Object.entries(exercises).reduce(
  (catalog, [group, categories]) => {
    catalog[group as MuscleGroup] = Object.entries(categories).reduce(
      (nextCategories, [subcategory, items]) => {
        nextCategories[subcategory] = items;
        return nextCategories;
      },
      {} as Record<string, readonly string[]>
    );

    return catalog;
  },
  {} as Record<MuscleGroup, Record<string, readonly string[]>>
);