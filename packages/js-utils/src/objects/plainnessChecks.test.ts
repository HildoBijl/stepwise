import { describe, expect, it } from 'vitest'

import { ensurePlainObject, isEmptyObject, isPlainDataArray, isPlainDataObject, isPlainDataValue, isPlainObject } from './plainnessChecks.ts'

describe('plain object and data checks', () => {
	it('recognizes plain and empty objects', () => {
		const nullPrototype = Object.create(null) as Record<string, unknown>
		expect(isPlainObject({})).toBe(true)
		expect(isPlainObject(nullPrototype)).toBe(true)
		expect(isPlainObject([])).toBe(false)
		expect(isPlainObject(new Date())).toBe(false)
		expect(isEmptyObject({})).toBe(true)
		expect(isEmptyObject({ a: 1 })).toBe(false)
		expect(ensurePlainObject(nullPrototype)).toBe(nullPrototype)
	})

	it('excludes React elements', () => {
		expect(isPlainObject({ $$typeof: Symbol.for('react.element') })).toBe(false)
	})

	it('recognizes recursively plain data', () => {
		expect(isPlainDataValue({ a: [1, 'x', null, false] })).toBe(true)
		expect(isPlainDataArray([1, { a: true }])).toBe(true)
		expect(isPlainDataObject({ a: [1] })).toBe(true)
		expect(isPlainDataValue({ fn: () => 1 })).toBe(false)
		expect(isPlainDataValue([, 1])).toBe(false)
		const circular: Record<string, unknown> = {}
		circular.self = circular
		expect(isPlainDataValue(circular)).toBe(false)
	})
})
