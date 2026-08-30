import { type ValueTypes, combineValueTypes } from '@step-wise/value-types'
import { mathematicsValueTypes } from '@step-wise/mathematics-value-types'
import { physicsValueTypes } from '@step-wise/physics-value-types'

import { VectorType, vectorValueType } from './vector.ts'
import { FreeBodyDiagramType, freeBodyDiagramValueType } from './freeBodyDiagram.ts'

export const mechanicsValueTypes = {
	[FreeBodyDiagramType]: freeBodyDiagramValueType,
	[VectorType]: vectorValueType,
} satisfies ValueTypes

export const mechanicsWithPhysicsValueTypes = combineValueTypes(mechanicsValueTypes, physicsValueTypes)

export const mechanicsWithPhysicsAndMathematicsValueTypes = combineValueTypes(mechanicsWithPhysicsValueTypes, mathematicsValueTypes)
