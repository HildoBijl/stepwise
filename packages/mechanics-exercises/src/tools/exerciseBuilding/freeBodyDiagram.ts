import { freeBodyDiagramValueTypes } from '#mechanicsValueTypes/freeBodyDiagramValueTypes'

import { createExerciseBuilders } from './support.ts'

export const { buildMonoExercise, buildStepExercise } = createExerciseBuilders(freeBodyDiagramValueTypes)
export { createStepExerciseMetadata } from './support.ts'
