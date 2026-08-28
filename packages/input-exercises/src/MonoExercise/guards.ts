import { hasInputExerciseProperties } from '../InputExercise/index.ts'

import type { MonoExercise } from './types.ts'

export function isMonoExercise(value: unknown): value is MonoExercise<any, any> {
	return hasInputExerciseProperties(value) && value.type === 'mono'
}
