import { getByPath } from '@step-wise/utils'
import { type SkillId } from '@step-wise/skill-definition'
import { type Exercise, type ExerciseId, type FullExerciseId, type ExerciseContainer, isExerciseContainer, splitFullExerciseId } from '@step-wise/exercise-definition'
import { getSkill } from '@step-wise/skill-tree'

import * as allExercises from './exerciseGatherer'

// Extract all exercises defined for a certain skill.
export function getExercises(skillId: SkillId): ExerciseContainer | undefined {
	const skill = getSkill(skillId)
	const skillExercises = getByPath(allExercises, skill.path)
	if (skillExercises === undefined) return undefined
	if (!isExerciseContainer(skillExercises)) throw new Error(`Invalid exercises found at skill ${skill.id}.`)
	return skillExercises
}

// Extract a certain exercise.
export function getExercise(skillId: SkillId, exerciseId: ExerciseId): Exercise | undefined {
	const exercises = getExercises(skillId)
	if (exercises === undefined) return undefined
	return exercises[exerciseId]
}

// Extract an exercise from a FullExerciseId.
export function getExerciseFromFullId(fullExerciseId: FullExerciseId): Exercise | undefined {
	const { skillId, exerciseId } = splitFullExerciseId(fullExerciseId)
	return getExercise(skillId, exerciseId)
}
