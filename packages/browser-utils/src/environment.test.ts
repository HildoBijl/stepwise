import { afterEach, describe, expect, it, vi } from 'vitest'

import { isLocalhost } from './environment.ts'

afterEach(() => vi.unstubAllGlobals())

describe('isLocalhost', () => {
	it.each([
		'localhost',
		'[::1]',
		'127.0.0.1',
		'127.255.12.3',
	])('recognizes %s as a local hostname', hostname => {
		vi.stubGlobal('window', { location: { hostname } })
		expect(isLocalhost()).toBe(true)
	})

	it('rejects non-local hostnames', () => {
		vi.stubGlobal('window', { location: { hostname: 'example.com' } })
		expect(isLocalhost()).toBe(false)
	})
})
