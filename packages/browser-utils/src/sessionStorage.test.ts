// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import { readSessionStorageValue, writeSessionStorageValue } from './sessionStorage.ts'

beforeEach(() => sessionStorage.clear())

describe('session-storage values', () => {
	it('writes and reads JSON values', () => {
		writeSessionStorageValue('exercise', { id: 'exercise-id' })
		expect(readSessionStorageValue('exercise')).toEqual({ id: 'exercise-id' })
	})

	it('preserves non-JSON strings and uses fallbacks for absent values', () => {
		sessionStorage.setItem('raw', 'not JSON')
		expect(readSessionStorageValue('raw')).toBe('not JSON')
		expect(readSessionStorageValue('missing', 42)).toBe(42)
	})

	it.each([null, undefined])('removes values when writing %s', value => {
		sessionStorage.setItem('value', 'present')
		writeSessionStorageValue('value', value)
		expect(sessionStorage.getItem('value')).toBeNull()
	})
})
