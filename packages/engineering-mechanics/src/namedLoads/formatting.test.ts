import { describe, expect, it } from 'vitest'

import { getLoadNameSubscript } from './formatting.ts'

describe('load-name formatting', () => {
	it('combines point and suffix into a subscript', () => {
		expect(getLoadNameSubscript({ symbol: 'F', point: 'A' })).toBe('A')
		expect(getLoadNameSubscript({ symbol: 'F', suffix: 'x' })).toBe('x')
		expect(getLoadNameSubscript({ symbol: 'F', point: 'A', suffix: 'x' })).toBe('Ax')
		expect(getLoadNameSubscript({ symbol: 'F', point: 'A', suffix: 2 })).toBe('A2')
	})

	it('returns undefined without a point or suffix', () => {
		expect(getLoadNameSubscript({ symbol: 'M' })).toBeUndefined()
	})

	it('validates its input', () => {
		expect(() => getLoadNameSubscript({ symbol: '' })).toThrow()
		expect(() => getLoadNameSubscript({ symbol: 'F', suffix: NaN })).toThrow()
	})
})
