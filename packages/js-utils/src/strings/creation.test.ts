import { describe, expect, it } from 'vitest'

import { alphabet, getSpreadsheetColumnLabel } from './creation'

describe('string creation', () => {
	it('exports the lowercase English alphabet', () => expect(alphabet).toBe('abcdefghijklmnopqrstuvwxyz'))

	it.each([[0, ''], [1, 'a'], [26, 'z'], [27, 'aa'], [52, 'az'], [53, 'ba'], [702, 'zz'], [703, 'aaa']] as const)('maps %i to spreadsheet label %s', (input, expected) => {
		expect(getSpreadsheetColumnLabel(input)).toBe(expected)
	})

	it('rejects invalid column numbers', () => {
		expect(() => getSpreadsheetColumnLabel(-1)).toThrow(RangeError)
		expect(() => getSpreadsheetColumnLabel(1.5)).toThrow(TypeError)
	})
})
