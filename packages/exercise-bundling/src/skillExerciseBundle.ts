import { type ExerciseCollection } from './exerciseCollection'

// Specifications for the exercises of a skill.
export type SkillExerciseBundle<T extends ExerciseCollection = ExerciseCollection> = {
	exercises: T
	examples: T
}

// Set up SkillExerciseBundle with equal exercises and examples.
export function withSameExamples<T extends ExerciseCollection>(exercises: T): SkillExerciseBundle<T> {
	return { exercises, examples: exercises }
}
