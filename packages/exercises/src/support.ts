import { getByPath, isPlainObject } from '@step-wise/js-utils'
import { type SkillId } from '@step-wise/skill-definition'
import { type Exercise } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseCollection, isExerciseCollection, isEmptyExerciseCollection } from '@step-wise/exercise-bundling'
import { getSkill } from '@step-wise/skill-tree'

import * as allExercises from './exerciseGatherer'

// Extract all exercises defined for a certain skill.
export function getExercises(skillId: SkillId, examples = false): ExerciseCollection | undefined {
	const skill = getSkill(skillId)
	const skillExerciseBundle = getByPath(allExercises, [...skill.groupPath, skill.id])
	if (skillExerciseBundle === undefined) return undefined
	if (!isPlainObject(skillExerciseBundle)) throw new Error(`Invalid exercises found at skill ${skillId}: the skill definitions did not return a plain object but gave something of type "${typeof skillExerciseBundle}".`)
	const label = examples ? 'examples' : 'exercises'
	const exercises = skillExerciseBundle[label]
	if (!isExerciseCollection(exercises)) throw new Error(`Invalid exercises found at skill ${skillId}: the "${label}" property was not an exercise collection.`)
	return exercises
}

export function hasExercises(skillId: SkillId): boolean {
	return !isEmptyExerciseCollection(getExercises(skillId))
}

// Extract all examples defined for a certain skill.
export function getExamples(skillId: SkillId): ExerciseCollection | undefined {
	return getExercises(skillId, true)
}

export function hasExamples(skillId: SkillId): boolean {
	return !isEmptyExerciseCollection(getExamples(skillId))
}

// Extract examples and exercises combined.
export function getAllExercises(skillId: SkillId): ExerciseCollection {
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
