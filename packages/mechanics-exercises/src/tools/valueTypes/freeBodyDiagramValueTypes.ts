import type { ValueTypes } from '@step-wise/value-types'

import { FreeBodyDiagramType, freeBodyDiagramValueType } from './freeBodyDiagram.ts'

export const freeBodyDiagramValueTypes = {
	[FreeBodyDiagramType]: freeBodyDiagramValueType,
} satisfies ValueTypes

export { FreeBodyDiagramType }
