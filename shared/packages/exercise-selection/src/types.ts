import { type ExerciseState, type ExerciseId, type FullExerciseId } from '@step-wise/exercise-definition'

export type PreviousExercise = {
	exerciseId: FullExerciseId
	createdAt: number
	updatedAt: number
}

export type ExerciseInstance = {
	exerciseId: ExerciseId
	state: ExerciseState
}
