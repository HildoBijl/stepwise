import { type ExerciseContainer } from './exerciseContainer'

// Specifications for the exercises of a skill.
export type SkillExercises<T extends ExerciseContainer = ExerciseContainer> = {
	exercises: T
	examples: T
}

// Set up SkillExercises with equal exercises and examples.
export function withSameExamples<T extends ExerciseContainer>(exercises: T): SkillExercises<T> {
	return { exercises, examples: exercises }
}
