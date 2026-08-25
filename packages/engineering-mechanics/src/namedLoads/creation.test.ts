import { describe, expect, it } from 'vitest'

import { createForce, createLoadName, createNamedLoad, createNamedPoint, isLoadName, isNamedLoad, isNamedPoint } from '../..'

describe('named-load creation and checks', () => {
	it('creates canonical named points', () => {
		const point = createNamedPoint({ name: 'A', position: [1, 2] })
		expect(point.position.coordinates).toEqual([1, 2])
		expect(isNamedPoint(point)).toBe(true)
		expect(Object.isFrozen(point)).toBe(true)
		expect(createNamedPoint(point)).toBe(point)
	})

	it('creates load names with optional string or numerical suffixes', () => {
		expect(createLoadName({ symbol: 'F' })).toEqual({ symbol: 'F' })
		expect(createLoadName({ symbol: 'F', point: 'A', suffix: 'x' })).toEqual({ symbol: 'F', point: 'A', suffix: 'x' })
		expect(createLoadName({ symbol: 'F', suffix: 2 })).toEqual({ symbol: 'F', suffix: 2 })
		expect(isLoadName({ symbol: 'M', suffix: 1 })).toBe(true)
	})

	it('creates deeply canonical named loads', () => {
		const namedLoad = createNamedLoad({ load: { type: 'Force', position: [0, 0], angle: 0 }, name: { symbol: 'F', point: 'A' } })
		expect(isNamedLoad(namedLoad)).toBe(true)
		expect(Object.isFrozen(namedLoad)).toBe(true)
		expect(Object.isFrozen(namedLoad.load)).toBe(true)
		expect(Object.isFrozen(namedLoad.name)).toBe(true)
		expect(createNamedLoad(namedLoad)).toBe(namedLoad)
	})

	it('rejects malformed names, positions, and nested loads', () => {
		expect(() => createNamedPoint({ name: '', position: [0, 0] })).toThrow()
		expect(() => createNamedPoint({ name: 'A', position: [0, 0, 0] })).toThrow()
		expect(() => createLoadName({ symbol: '' })).toThrow()
		expect(() => createLoadName({ symbol: 'F', suffix: Infinity })).toThrow()
		expect(() => createNamedLoad({ load: { type: 'Unknown' } as never, name: { symbol: 'F' } })).toThrow()
		expect(isNamedLoad({ load: createForce({ position: [0, 0], angle: 0 }), name: { symbol: '' } })).toBe(false)
	})
})
