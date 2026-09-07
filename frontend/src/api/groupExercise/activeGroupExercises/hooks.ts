import type { SkillId } from '@step-wise/skill-definition'

import type { ActiveGroupExercisesState, GroupExercise } from '../types.ts'

import { useActiveGroupExercisesContext } from './context.ts'

export function useActiveGroupExercisesState(): ActiveGroupExercisesState {
	return useActiveGroupExercisesContext()
}

export function useActiveGroupExercises(): GroupExercise[] | undefined {
	return useActiveGroupExercisesState().exercises
}

export function useActiveGroupExercise(skillId: SkillId): GroupExercise | undefined {
	return useActiveGroupExercises()?.find(exercise => exercise.skillId === skillId)
}
