import { type ExerciseState } from '@step-wise/exercise-definition'
import { type ExerciseId, type FullExerciseId } from '@step-wise/exercise-bundling'

export type PreviousExercise = {
	exerciseId: FullExerciseId
	createdAt: number
	updatedAt: number
}

export type ExerciseInstance = {
	exerciseId: ExerciseId
	state: ExerciseState
}
