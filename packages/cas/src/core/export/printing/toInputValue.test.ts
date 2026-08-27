import { fraction, sum } from '../../construction'

import { nodeToInputValue } from './toInputValue'

describe('nodeToInputValue', () => {
	test('creates an expression input value with settings', () => {
		const value = nodeToInputValue(sum(fraction('x', 2), 1), {}, { angleUnit: 'degrees' })
		expect(value.type).toBe('Expression')
		expect(value.expressionSettings).toEqual({ angleUnit: 'degrees' })
		expect(value.value.length).toBeGreaterThan(0)
	})
})
