import { type AnyExercise, resolveExerciseMetadata } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/module-tree-definition'
import { getExercise } from '@step-wise/exercises'

export type ExerciseDefinitionReference = {
	exerciseId: string
	exerciseVersion: number
}

export function getCompatibleExerciseDefinition(skillId: SkillId, exercise: ExerciseDefinitionReference): AnyExercise | undefined {
	const definition = getExercise(skillId, exercise.exerciseId)
	if (!definition || exercise.exerciseVersion !== resolveExerciseMetadata(definition.metadata).version) return undefined
	return definition
}

export function isExerciseCompatible(skillId: SkillId, exercise: ExerciseDefinitionReference): boolean {
	return getCompatibleExerciseDefinition(skillId, exercise) !== undefined
}
