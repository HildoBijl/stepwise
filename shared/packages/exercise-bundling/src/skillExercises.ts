import { type ExerciseContainer } from './exerciseContainer'

// Specifications for the exercises of a skill.
export type SkillExercises = {
	exercises: ExerciseContainer
	examples: ExerciseContainer
}

// Set up SkillExercises with equal exercises and examples.
export function withSameExamples<T extends ExerciseContainer>(exercises: T): SkillExercises {
	return { exercises, examples: exercises }
}
