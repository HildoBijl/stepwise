import { getByPath, isPlainObject } from '@step-wise/js-utils'
import { type SkillId } from '@step-wise/skill-definition'
import { type Exercise } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseCollection, isExerciseCollection, isEmptyExerciseCollection } from '@step-wise/exercise-bundling'
import { getSkill } from '@step-wise/skill-tree'

import * as exerciseRegistry from './exerciseRegistry'

function getExerciseCollection(skillId: SkillId, collectionName: 'examples' | 'exercises'): ExerciseCollection | undefined {
	const skill = getSkill(skillId)
	const skillExerciseBundle = getByPath(exerciseRegistry, [...skill.groupPath, skill.id])
	if (skillExerciseBundle === undefined) return undefined
	if (!isPlainObject(skillExerciseBundle)) throw new Error(`Invalid exercises found at skill ${skillId}: the skill definitions did not return a plain object but gave something of type "${typeof skillExerciseBundle}".`)
	Object.freeze(skillExerciseBundle)
	const exercises = skillExerciseBundle[collectionName]
	if (!isExerciseCollection(exercises)) throw new Error(`Invalid exercises found at skill ${skillId}: the "${collectionName}" property was not an exercise collection.`)
	return Object.freeze(exercises)
}

// Extract all exercises defined for a certain skill.
export function getExercises(skillId: SkillId): ExerciseCollection | undefined {
	return getExerciseCollection(skillId, 'exercises')
}

export function hasExercises(skillId: SkillId): boolean {
	return !isEmptyExerciseCollection(getExercises(skillId))
}

// Extract all examples defined for a certain skill.
export function getExamples(skillId: SkillId): ExerciseCollection | undefined {
	return getExerciseCollection(skillId, 'examples')
}

export function hasExamples(skillId: SkillId): boolean {
	return !isEmptyExerciseCollection(getExamples(skillId))
}

// Extract examples and exercises combined.
export function getAllExercises(skillId: SkillId): ExerciseCollection {
	const examples = getExamples(skillId) ?? {}
	const exercises = getExercises(skillId) ?? {}
	for (const [exerciseId, example] of Object.entries(examples)) {
		if (Object.hasOwn(exercises, exerciseId) && exercises[exerciseId] !== example) throw new Error(`Invalid exercises found at skill ${skillId}: example and exercise "${exerciseId}" use different definitions.`)
	}
	return Object.freeze({ ...examples, ...exercises })
}

// Extract a certain exercise.
export function getExercise(skillId: SkillId, exerciseId: ExerciseId): Exercise | undefined {
	const exercises = getAllExercises(skillId)
	return exercises[exerciseId]
}
