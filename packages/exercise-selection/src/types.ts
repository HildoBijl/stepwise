import { type BaseExerciseInstance } from '@step-wise/exercise-definition'
import { type ExerciseId } from '@step-wise/exercise-bundling'

export type PreviousExercise = {
	exerciseId: ExerciseId
	createdAt: number
	updatedAt: number
}

export type ExerciseInstance = BaseExerciseInstance & {
	exerciseId: ExerciseId
}
