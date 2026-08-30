import { describe, expect, it } from 'vitest'

import { interpretInputValue } from './interpret.ts'
import { TestNumberType, testInputValueAdapters } from './testUtils.ts'
import { toInputValue } from './toInputValue.ts'

describe('input-value round trips', () => {
	it('preserves a value through JSON-safe input data', () => {
		const storedInputValue = JSON.parse(JSON.stringify(toInputValue(42, TestNumberType, testInputValueAdapters)))
		expect(interpretInputValue(storedInputValue, testInputValueAdapters)).toBe(42)
	})
})
