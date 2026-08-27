import { describe, expect, it } from 'vitest'

import { loadNameToVariable } from './namedLoads'

describe('loadNameToVariable', () => {
	it('converts load names with and without subscripts', () => {
		expect(loadNameToVariable({ symbol: 'P' }).toString()).toBe('P')
		expect(loadNameToVariable({ symbol: 'F', point: 'A', suffix: 'x' }).toString()).toBe('F_(Ax)')
		expect(loadNameToVariable({ symbol: 'M', suffix: 2 }).toString()).toBe('M_2')
	})
})
