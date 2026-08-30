import { freeBodyDiagramWithPhysicsValueTypes } from '#valueTypes/combinations'

import { createExerciseBuilders } from './support.ts'

export const { buildMonoExercise, buildStepExercise } = createExerciseBuilders(freeBodyDiagramWithPhysicsValueTypes)
export { createStepExerciseMetadata } from './support.ts'
