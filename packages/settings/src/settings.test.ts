import { describe, expect, it } from 'vitest'

import { defaultDecimalSeparator } from './index.ts'

describe('number settings', () => {
	it('uses a comma as the site-wide decimal separator', () => {
		expect(defaultDecimalSeparator).toBe(',')
	})
})
