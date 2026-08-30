import { vectorWithPhysicsValueTypes } from '#valueTypes/combinations'

import { createExerciseBuilders } from './support.ts'

export const { buildMonoExercise, buildStepExercise } = createExerciseBuilders(vectorWithPhysicsValueTypes)
export { createStepExerciseMetadata } from './support.ts'
