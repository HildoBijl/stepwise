import { describe, expect, it } from 'vitest'

import { Quantity, QuantityType } from '@step-wise/physics-core'

import { IntegerType } from './adapters/index.ts'
import { toInputValue } from './toInputValue.ts'

describe('toInputValue', () => {
	it('converts a domain value using the requested input type', () => {
		expect(toInputValue(42, IntegerType)).toEqual({ type: IntegerType, value: '42' })
	})

	it('uses editable input data rather than storage data', () => {
		expect(toInputValue(new Quantity('9.81 m/s^2'), QuantityType)).toEqual({
			type: QuantityType,
			value: {
				value: { number: '9.81' },
				unit: {
					numerator: [{ text: 'm' }],
					denominator: [{ text: 's', power: '2' }],
				},
			},
		})
	})

	it('rejects missing, unknown, and inherited type names', () => {
		expect(() => toInputValue(3, undefined as never)).toThrow(/string type/)
		expect(() => toInputValue(3, 'Unknown')).toThrow(/unknown type/)
		expect(() => toInputValue(3, 'toString')).toThrow(/unknown type/)
	})
})
