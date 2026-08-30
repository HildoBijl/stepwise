import { describe, expect, it } from 'vitest'

import { extractValueTypeAdapters } from '@step-wise/value-types'
import { ExpressionType, EquationType } from '@step-wise/mathematics-value-types'
import { PrecisionNumberType, QuantityType, UnitType } from '@step-wise/physics-value-types'

import { FreeBodyDiagramType } from './freeBodyDiagram.ts'
import { VectorType } from './vector.ts'
import { mechanicsValueTypes, mechanicsWithPhysicsAndMathematicsValueTypes, mechanicsWithPhysicsValueTypes } from './valueTypes.ts'

describe('mechanics value-type registries', () => {
	it('keeps the base registry selective', () => {
		const adapters = extractValueTypeAdapters(mechanicsValueTypes)

		expect(Object.keys(mechanicsValueTypes)).toEqual([FreeBodyDiagramType, VectorType])
		expect(adapters.inputValueAdapters[FreeBodyDiagramType]).toBeDefined()
		expect(adapters.equalityAdapters[FreeBodyDiagramType]).toBeDefined()
		expect(adapters.serializationAdapters[VectorType]).toBeDefined()
		expect(adapters.serializationAdapters[FreeBodyDiagramType]).toBeUndefined()
		expect(adapters.inputValueAdapters[VectorType]).toBeUndefined()
		expect(adapters.equalityAdapters[VectorType]).toBeUndefined()
	})

	it('adds physics value types without mathematics', () => {
		expect(Object.keys(mechanicsWithPhysicsValueTypes)).toEqual([FreeBodyDiagramType, VectorType, PrecisionNumberType, UnitType, QuantityType])
	})

	it('adds mathematics to the complete mechanics registry', () => {
		expect(Object.keys(mechanicsWithPhysicsAndMathematicsValueTypes)).toEqual([FreeBodyDiagramType, VectorType, PrecisionNumberType, UnitType, QuantityType, ExpressionType, EquationType])
	})
})
