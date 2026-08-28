import { describe, expect, it } from 'vitest'

import { ExpressionType, asExpression } from '@step-wise/cas'
import { VectorType, Vector } from '@step-wise/geometry'
import { QuantityType, Quantity } from '@step-wise/physics-core'

import { IntegerType, MultipleChoiceType, interpretInputValue, toInputValue } from './index.ts'

describe('input-value round trips', () => {
	const cases = [
		[IntegerType, 42],
		[MultipleChoiceType, [2, 4]],
		[ExpressionType, asExpression('x+2')],
		[VectorType, new Vector(1, 2)],
		[QuantityType, new Quantity('9.81 m/s^2')],
	] as const

	it.each(cases)('preserves a %s through JSON-safe input data', (type, domainValue) => {
		const storedInputValue = JSON.parse(JSON.stringify(toInputValue(domainValue, type)))
		expect(interpretInputValue(storedInputValue)).toEqual(domainValue)
	})
})
