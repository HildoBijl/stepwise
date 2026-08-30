import { combineValueTypes } from '@step-wise/value-types'

import { freeBodyDiagramValueTypes } from './freeBodyDiagramValueTypes.ts'
import { vectorValueTypes } from './vectorValueTypes.ts'

export const mechanicsValueTypes = combineValueTypes(freeBodyDiagramValueTypes, vectorValueTypes)
