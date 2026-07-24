import { type SkillId } from '@step-wise/skill-setup'

import { type ExerciseId } from './types'

export type FullExerciseId = string

export function getFullExerciseId(skillId: SkillId, exerciseId: ExerciseId): FullExerciseId {
	return `${skillId}.${exerciseId}`
}

export function splitFullExerciseId(fullExerciseId: FullExerciseId): { skillId: SkillId, exerciseId: ExerciseId } {
	const index = fullExerciseId.indexOf('.')
	if (index === -1) throw new Error(`Invalid full exercise ID "${fullExerciseId}".`)
	return {
		skillId: fullExerciseId.slice(0, index),
		exerciseId: fullExerciseId.slice(index + 1),
	}
}
