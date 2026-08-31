import { describe, expect, it } from 'vitest'

import { extractValueTypeAdapters } from '@step-wise/value-types'

import { FreeBodyDiagramType } from './freeBodyDiagram.ts'
import { VectorType } from './vector.ts'
import { freeBodyDiagramValueTypes } from './freeBodyDiagramValueTypes.ts'
import { vectorValueTypes } from './vectorValueTypes.ts'
import { PrecisionNumberType, QuantityType, UnitType } from './physicsValueTypes.ts'
import { ExpressionType, EquationType } from './mathematicsValueTypes.ts'
import { mechanicsValueTypes } from './mechanicsValueTypes.ts'
import { freeBodyDiagramWithPhysicsValueTypes, mechanicsWithPhysicsAndMathematicsValueTypes, mechanicsWithPhysicsValueTypes, vectorWithPhysicsValueTypes } from './combinations.ts'

describe('mechanics value-type registries', () => {
	it('keeps FreeBodyDiagram and Vector capabilities atomic', () => {
		const freeBodyDiagramAdapters = extractValueTypeAdapters(freeBodyDiagramValueTypes)
		const vectorAdapters = extractValueTypeAdapters(vectorValueTypes)

		expect(Object.keys(freeBodyDiagramValueTypes)).toEqual([FreeBodyDiagramType])
		expect(freeBodyDiagramAdapters.inputValueAdapters[FreeBodyDiagramType]).toBeDefined()
		expect(freeBodyDiagramAdapters.equalityAdapters[FreeBodyDiagramType]).toBeDefined()
		expect(freeBodyDiagramAdapters.serializationAdapters[FreeBodyDiagramType]).toBeUndefined()
		expect(Object.keys(vectorValueTypes)).toEqual([VectorType])
		expect(vectorAdapters.serializationAdapters[VectorType]).toBeDefined()
		expect(vectorAdapters.inputValueAdapters[VectorType]).toBeUndefined()
		expect(vectorAdapters.equalityAdapters[VectorType]).toBeUndefined()
	})

	it('combines the complete mechanics registry on demand', () => {
		expect(Object.keys(mechanicsValueTypes)).toEqual([FreeBodyDiagramType, VectorType])
	})

	it('supports the physics combinations used by current exercises', () => {
		expect(Object.keys(freeBodyDiagramWithPhysicsValueTypes)).toEqual([FreeBodyDiagramType, PrecisionNumberType, UnitType, QuantityType])
		expect(Object.keys(vectorWithPhysicsValueTypes)).toEqual([VectorType, PrecisionNumberType, UnitType, QuantityType])
		expect(Object.keys(mechanicsWithPhysicsValueTypes)).toEqual([FreeBodyDiagramType, VectorType, PrecisionNumberType, UnitType, QuantityType])
	})

	it('adds mathematics to the complete mechanics registry', () => {
		expect(Object.keys(mechanicsWithPhysicsAndMathematicsValueTypes)).toEqual([FreeBodyDiagramType, VectorType, PrecisionNumberType, UnitType, QuantityType, ExpressionType, EquationType])
	})
})
