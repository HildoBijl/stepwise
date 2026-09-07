// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import { readLocalStorageValue, writeLocalStorageValue } from './localStorage.ts'

beforeEach(() => localStorage.clear())

describe('local-storage values', () => {
	it('writes and reads JSON values', () => {
		writeLocalStorageValue('settings', { enabled: true })
		expect(readLocalStorageValue('settings')).toEqual({ enabled: true })
	})

	it('preserves non-JSON strings and uses fallbacks for absent values', () => {
		localStorage.setItem('raw', 'not JSON')
		expect(readLocalStorageValue('raw')).toBe('not JSON')
		expect(readLocalStorageValue('missing', 42)).toBe(42)
	})

	it.each([null, undefined])('removes values when writing %s', value => {
		localStorage.setItem('value', 'present')
		writeLocalStorageValue('value', value)
		expect(localStorage.getItem('value')).toBeNull()
	})
})
