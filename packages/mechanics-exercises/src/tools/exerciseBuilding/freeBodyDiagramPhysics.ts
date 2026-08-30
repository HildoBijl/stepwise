import { freeBodyDiagramWithPhysicsValueTypes } from '#mechanicsValueTypes/combinations'

import { createExerciseBuilders } from './support.ts'

export const { buildMonoExercise, buildStepExercise } = createExerciseBuilders(freeBodyDiagramWithPhysicsValueTypes)
export { createStepExerciseMetadata } from './support.ts'
