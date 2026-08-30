import { describe, expect, it } from 'vitest'

import { PrecisionNumberType as CorePrecisionNumberType, QuantityType as CoreQuantityType, UnitType as CoreUnitType } from '@step-wise/physics-core'
import { extractValueTypeAdapters, isValueTypes } from '@step-wise/value-types'

import { precisionNumberValueType } from './precisionNumber.ts'
import { unitValueType } from './unit.ts'
import { quantityValueType } from './quantity.ts'
import { physicsValueTypes } from './valueTypes.ts'
import { PrecisionNumberType, QuantityType, UnitType } from './index.ts'

describe('physics value types', () => {
	it('exports the individual value types under their physics-core discriminators', () => {
		expect(PrecisionNumberType).toBe(CorePrecisionNumberType)
		expect(UnitType).toBe(CoreUnitType)
		expect(QuantityType).toBe(CoreQuantityType)
		expect(physicsValueTypes).toEqual({
			[PrecisionNumberType]: precisionNumberValueType,
			[UnitType]: unitValueType,
			[QuantityType]: quantityValueType,
		})
		expect(isValueTypes(physicsValueTypes)).toBe(true)
	})

	it('provides all three adapter capabilities for every type', () => {
		const adapters = extractValueTypeAdapters(physicsValueTypes)
		expect(adapters.inputValueAdapters[PrecisionNumberType]).toBe(precisionNumberValueType.inputValue)
		expect(adapters.serializationAdapters[PrecisionNumberType]).toBe(precisionNumberValueType.serialization)
		expect(adapters.equalityAdapters[PrecisionNumberType]).toBe(precisionNumberValueType.equality)
		expect(adapters.inputValueAdapters[UnitType]).toBe(unitValueType.inputValue)
		expect(adapters.serializationAdapters[UnitType]).toBe(unitValueType.serialization)
		expect(adapters.equalityAdapters[UnitType]).toBe(unitValueType.equality)
		expect(adapters.inputValueAdapters[QuantityType]).toBe(quantityValueType.inputValue)
		expect(adapters.serializationAdapters[QuantityType]).toBe(quantityValueType.serialization)
		expect(adapters.equalityAdapters[QuantityType]).toBe(quantityValueType.equality)
	})
})
