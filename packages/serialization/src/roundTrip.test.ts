import { describe, expect, it } from 'vitest'

import { asExpression } from '@step-wise/cas'
import { Vector } from '@step-wise/geometry'
import { PrecisionNumber } from '@step-wise/physics-core'

import { deserializeData, serializeData } from './index.ts'

describe('serialization round trips', () => {
	it('preserves nested data through serialization and JSON storage', () => {
		const expression = asExpression('x+2')
		const data = {
			values: [expression, new Vector(1, 2), new PrecisionNumber('3.140')],
			nested: { enabled: true, count: 2, empty: null },
		}
		const storedData = JSON.parse(JSON.stringify(serializeData(data)))
		expect(deserializeData(storedData)).toEqual(data)
	})

	it('stores infinite significant digits in JSON-safe form', () => {
		const value = new PrecisionNumber(3.14)
		const storedData = JSON.parse(JSON.stringify(serializeData(value)))
		expect(storedData).toEqual({
			type: 'PrecisionNumber',
			value: { number: 3.14, significantDigits: 'Infinity' },
		})
		expect(deserializeData(storedData)).toEqual(value)
	})
})
