import { type ExerciseState } from '@step-wise/exercise-definition'
import { type ExerciseId } from '@step-wise/exercise-bundling'

export type PreviousExercise = {
	exerciseId: ExerciseId
	createdAt: number
	updatedAt: number
}

export type ExerciseInstance = {
	exerciseId: ExerciseId
	state: ExerciseState
}
