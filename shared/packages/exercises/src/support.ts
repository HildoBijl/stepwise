import { getByPath, isPlainObject } from '@step-wise/utils'
import { type SkillId } from '@step-wise/skill-definition'
import { type Exercise, type ExerciseId, type FullExerciseId, type ExerciseContainer, isExerciseContainer, isEmptyExerciseContainer, splitFullExerciseId } from '@step-wise/exercise-definition'
import { getSkill } from '@step-wise/skill-tree'

import * as allExercises from './exerciseGatherer'

// Extract all exercises defined for a certain skill.
export function getExercises(skillId: SkillId, examples = false): ExerciseContainer | undefined {
	const skill = getSkill(skillId)
	const skillExercises = getByPath(allExercises, [...skill.path, skill.id])
	if (skillExercises === undefined) return undefined
	if (!isPlainObject(skillExercises)) throw new Error(`Invalid exercises found at skill ${skillId}: the skill definitions did not return a plain object but gave something of type "${typeof skillExercises}".`)
	const label = examples ? 'examples' : 'exercises'
	const exercises = skillExercises[label]
	if (!isExerciseContainer(exercises)) throw new Error(`Invalid exercises found at skill ${skillId}: the "${label}" property was not an exercise container.`)
	return exercises
}

export function hasExercises(skillId: SkillId): boolean {
	return !isEmptyExerciseContainer(getExercises(skillId))
}

// Extract all examples defined for a certain skill.
export function getExamples(skillId: SkillId): ExerciseContainer | undefined {
	return getExercises(skillId, true)
}

export function hasExamples(skillId: SkillId): boolean {
	return !isEmptyExerciseContainer(getExamples(skillId))
}

// Extract a certain exercise.
export function getExercise(skillId: SkillId, exerciseId: ExerciseId): Exercise | undefined {
	const exercises = {
		...(getExercises(skillId) ?? {}),
		...(getExamples(skillId) ?? {}),
	}
	return exercises[exerciseId]
}

// Extract an exercise from a FullExerciseId.
export function getExerciseByFullId(fullExerciseId: FullExerciseId): Exercise | undefined {
	const { skillId, exerciseId } = splitFullExerciseId(fullExerciseId)
	return getExercise(skillId, exerciseId)
}
