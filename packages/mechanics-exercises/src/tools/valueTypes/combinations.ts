import { combineValueTypes } from '@step-wise/value-types'

import { freeBodyDiagramValueTypes } from './freeBodyDiagramValueTypes.ts'
import { vectorValueTypes } from './vectorValueTypes.ts'
import { physicsValueTypes } from './physicsValueTypes.ts'
import { mathematicsValueTypes } from './mathematicsValueTypes.ts'
import { mechanicsValueTypes } from './mechanicsValueTypes.ts'

export const freeBodyDiagramWithPhysicsValueTypes = combineValueTypes(freeBodyDiagramValueTypes, physicsValueTypes)
export const vectorWithPhysicsValueTypes = combineValueTypes(vectorValueTypes, physicsValueTypes)
export const mechanicsWithPhysicsValueTypes = combineValueTypes(mechanicsValueTypes, physicsValueTypes)
export const mechanicsWithPhysicsAndMathematicsValueTypes = combineValueTypes(mechanicsWithPhysicsValueTypes, mathematicsValueTypes)
