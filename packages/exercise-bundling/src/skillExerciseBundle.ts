import { type ExerciseCollection } from './exerciseCollection'

// Specifications for the exercises of a skill.
export type SkillExerciseBundle<T extends ExerciseCollection = ExerciseCollection> = {
	readonly exercises: T
	readonly examples: T
}

// Set up SkillExerciseBundle with equal exercises and examples.
export function withSameExamples<T extends ExerciseCollection>(exercises: T): SkillExerciseBundle<Readonly<T>> {
	const frozenExercises = Object.freeze(exercises)
	return Object.freeze({ exercises: frozenExercises, examples: frozenExercises })
}
