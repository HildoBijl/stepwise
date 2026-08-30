import { describe, expect, it } from 'vitest'

import { EquationType, ExpressionType } from '@step-wise/cas'
import { extractValueTypeAdapters, isValueTypes } from '@step-wise/value-types'

import { equationValueType } from './equation.ts'
import { expressionValueType } from './expression.ts'
import { mathematicsValueTypes } from './valueTypes.ts'
import { EquationType as ExportedEquationType, ExpressionType as ExportedExpressionType } from './index.ts'

describe('mathematics value types', () => {
	it('exports the individual value types under their CAS discriminators', () => {
		expect(ExportedExpressionType).toBe(ExpressionType)
		expect(ExportedEquationType).toBe(EquationType)
		expect(mathematicsValueTypes).toEqual({
			[ExpressionType]: expressionValueType,
			[EquationType]: equationValueType,
		})
		expect(isValueTypes(mathematicsValueTypes)).toBe(true)
	})

	it('provides all three adapter capabilities for both types', () => {
		const adapters = extractValueTypeAdapters(mathematicsValueTypes)
		expect(adapters.inputValueAdapters[ExpressionType]).toBe(expressionValueType.inputValue)
		expect(adapters.serializationAdapters[ExpressionType]).toBe(expressionValueType.serialization)
		expect(adapters.equalityAdapters[ExpressionType]).toBe(expressionValueType.equality)
		expect(adapters.inputValueAdapters[EquationType]).toBe(equationValueType.inputValue)
		expect(adapters.serializationAdapters[EquationType]).toBe(equationValueType.serialization)
		expect(adapters.equalityAdapters[EquationType]).toBe(equationValueType.equality)
	})
})
