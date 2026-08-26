import { describe, expect, it } from 'vitest'

import { accentNames, isAccentName } from './accents'

describe('accent definitions', () => {
	it('lists and recognizes all supported accents', () => {
		expect(accentNames).toEqual(['dot', 'hat'])
		accentNames.forEach(name => expect(isAccentName(name)).toBe(true))
	})

	it.each(['', 'bar', 'toString'])('rejects the unsupported accent name %j', name => {
		expect(isAccentName(name)).toBe(false)
	})
})
