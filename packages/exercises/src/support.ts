import { getByPath, isPlainObject } from '@step-wise/utils'
import { type SkillId } from '@step-wise/skill-definition'
import { type Exercise } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseContainer, isExerciseContainer, isEmptyExerciseContainer } from '@step-wise/exercise-bundling'
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

// Extract examples and exercises combined.
export function getAllExercises(skillId: SkillId): ExerciseContainer {
	return {
		...(getExamples(skillId) ?? {}),
		...(getExercises(skillId) ?? {}),
	}
}

// Extract a certain exercise.
export function getExercise(skillId: SkillId, exerciseId: ExerciseId): Exercise | undefined {
	const exercises = getAllExercises(skillId)
	return exercises[exerciseId]
}
