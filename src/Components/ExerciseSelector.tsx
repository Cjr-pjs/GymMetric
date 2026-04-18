import type { MuscleGroup, MuscleMode } from '../data/exercises';
import { exerciseCatalog, exerciseGroupLabels } from '../data/exercises';

type ExerciseSelectorProps = {
  index: number;
  selectedGroup: MuscleGroup | '';
  selectedSubcategory: string;
  selectedExercise: string;
  mode: MuscleMode;
  enforceSplitRules: boolean;
  onGroupChange: (group: MuscleGroup | '') => void;
  onSubcategoryChange: (subcategory: string) => void;
  onExerciseChange: (exercise: string) => void;
};

function getSubcategories(group: MuscleGroup | '') {
  if (!group) {
    return [];
  }

  return Object.keys(exerciseCatalog[group]);
}

function getExercises(group: MuscleGroup | '', subcategory: string) {
  if (!group || !subcategory) {
    return [];
  }

  return exerciseCatalog[group][subcategory] ?? [];
}

export function ExerciseSelector({
  index,
  selectedGroup,
  selectedSubcategory,
  selectedExercise,
  mode,
  enforceSplitRules,
  onGroupChange,
  onSubcategoryChange,
  onExerciseChange
}: ExerciseSelectorProps) {
  const subcategories = getSubcategories(selectedGroup);
  const exercises = getExercises(selectedGroup, selectedSubcategory);
  const lockUpperBody = enforceSplitRules && mode === 'perna';
  const lockLegDay = enforceSplitRules && mode === 'superiores';

  return (
    <div className="rounded-xl border border-[#2f2f2f] bg-[#242424] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e6e6e6]">Exercicio {index + 1}</h3>
        <span className="text-xs text-[#8a8a8a]">Selecao estruturada</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-xs text-[#a3a3a3]">Grupo muscular</span>
          <select
            value={selectedGroup}
            onChange={(event) => onGroupChange(event.target.value as MuscleGroup | '')}
            className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition focus:border-[#5b7cff]"
          >
            <option value="">Selecione</option>
            <option value="costas" disabled={lockLegDay}>
              {exerciseGroupLabels.costas}
            </option>
            <option value="peito" disabled={lockLegDay}>
              {exerciseGroupLabels.peito}
            </option>
            <option value="perna" disabled={lockUpperBody}>
              {exerciseGroupLabels.perna}
            </option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-[#a3a3a3]">Subcategoria</span>
          <select
            value={selectedSubcategory}
            onChange={(event) => onSubcategoryChange(event.target.value)}
            disabled={!selectedGroup}
            className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition disabled:cursor-not-allowed disabled:bg-[#202020] disabled:text-[#707070] focus:border-[#5b7cff]"
          >
            <option value="">Selecione</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-[#a3a3a3]">Exercicio</span>
          <select
            value={selectedExercise}
            onChange={(event) => onExerciseChange(event.target.value)}
            disabled={!selectedSubcategory}
            className="w-full rounded-xl border border-[#2f2f2f] bg-[#191919] px-3 py-2 text-sm text-[#e6e6e6] outline-none transition disabled:cursor-not-allowed disabled:bg-[#202020] disabled:text-[#707070] focus:border-[#5b7cff]"
          >
            <option value="">Selecione</option>
            {exercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
