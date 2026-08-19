import { describe, expect, it } from 'vitest'

import { isSet } from './checks'

describe('set checks', () => {
	it('recognizes Set instances only', () => {
		expect(isSet(new Set())).toBe(true)
		expect(isSet(new Map())).toBe(false)
		expect(isSet({ has: () => true })).toBe(false)
	})
})
