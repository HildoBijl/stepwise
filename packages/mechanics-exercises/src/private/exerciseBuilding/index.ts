import { freeBodyDiagramValueTypes, freeBodyDiagramWithPhysicsValueTypes, vectorWithPhysicsValueTypes } from '#mechanicsValueTypes'

import { createExerciseBuilders } from './support.ts'

export const mechanicsExerciseBuilders = {
	freeBodyDiagram: createExerciseBuilders(freeBodyDiagramValueTypes),
	freeBodyDiagramPhysics: createExerciseBuilders(freeBodyDiagramWithPhysicsValueTypes),
	vectorPhysics: createExerciseBuilders(vectorWithPhysicsValueTypes),
}

export { createExerciseBuilders, createStepExerciseMetadata } from './support.ts'
