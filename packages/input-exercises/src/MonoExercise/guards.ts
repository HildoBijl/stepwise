import { hasInputExerciseProperties } from '../InputExercise'

import type { MonoExercise } from './types'

export function isMonoExercise(value: unknown): value is MonoExercise<any, any> {
	return hasInputExerciseProperties(value) && value.type === 'mono'
}
