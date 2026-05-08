import { toString } from '../export'

import { parserTestCases } from './testCases'

describe('toString', () => {
	test.each(parserTestCases)('prints "$str"', ({ str, node }) => {
		expect(toString(node)).toBe(str)
	})
})
