import { describe, expect, it } from 'vitest'

import { IntegerType, MultipleChoiceType, interpretInputValue, toInputValue } from './index.ts'

describe('input-value round trips', () => {
	it.each([[IntegerType, 42], [MultipleChoiceType, [2, 4]]] as const)('preserves a %s through JSON-safe input data', (type, domainValue) => {
		const storedInputValue = JSON.parse(JSON.stringify(toInputValue(domainValue, type)))
		expect(interpretInputValue(storedInputValue)).toEqual(domainValue)
	})
})