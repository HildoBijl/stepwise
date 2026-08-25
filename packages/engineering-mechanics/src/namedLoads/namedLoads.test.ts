import { Vector } from '@step-wise/geometry'

import { createForce, createMoment } from '../loads'

import { createLoadName, createNamedLoad, createNamedPoint } from './creation'
import { isLoadName, isNamedLoad } from './checks'
import { getLoadNameSubscript } from './formatting'
import { deriveLoadNames } from './nameDerivation'

describe('named loads', () => {
	test('creates, validates and formats structured load names', () => {
		const name = createLoadName({ symbol: 'F', point: 'A', suffix: 'x' })
		expect(isLoadName(name)).toBe(true)
		expect(getLoadNameSubscript(name)).toBe('Ax')
		expect(getLoadNameSubscript({ symbol: 'M' })).toBeUndefined()
		expect(() => createLoadName({ symbol: '', point: 'A' })).toThrow()
	})

	test('creates immutable named objects', () => {
		const point = createNamedPoint({ name: 'A', position: [1, 2] })
		const namedLoad = createNamedLoad({ load: createForce({ position: [1, 2], angle: 0 }), name: { symbol: 'F', point: 'A' } })
		expect(Object.isFrozen(point)).toBe(true)
		expect(Object.isFrozen(namedLoad)).toBe(true)
		expect(Object.isFrozen(namedLoad.name)).toBe(true)
		expect(Object.isFrozen(namedLoad.load)).toBe(true)
	})

	test('derives component and moment names at a named point', () => {
		const A = new Vector(1, 2)
		const horizontal = createForce({ position: A, angle: Math.PI })
		const vertical = createForce({ position: A, angle: Math.PI / 2 })
		const moment = createMoment({ position: A, clockwise: true })
		const namedLoads = deriveLoadNames([vertical, moment, horizontal], [{ name: 'A', position: A }])
		expect(namedLoads.map(({ name }) => name)).toEqual([
			{ symbol: 'F', point: 'A', suffix: 'x' },
			{ symbol: 'F', point: 'A', suffix: 'y' },
			{ symbol: 'M', point: 'A' },
		])
		expect(namedLoads.every(isNamedLoad)).toBe(true)
	})

	test('uses predefined names and keeps the matching input load', () => {
		const input = createForce({ position: Vector.zero, angle: Math.PI })
		const predefined = createForce({ position: Vector.zero, angle: 0 })
		const [namedLoad] = deriveLoadNames([input], [], [{ load: predefined, name: { symbol: 'P' } }], { predefinedLoadComparison: { force: { direction: 'parallel' } } })
		expect(namedLoad).toEqual({ load: input, name: { symbol: 'P' } })
		expect(namedLoad.load).toBe(input)
	})

	test('numbers multiple unnamed loads in a deterministic direction order', () => {
		const right = createForce({ position: [1, 0], angle: 0 })
		const down = createForce({ position: [2, 0], angle: -Math.PI / 2 })
		const namedLoads = deriveLoadNames([right, down])
		expect(namedLoads).toEqual([
			{ load: down, name: { symbol: 'F', suffix: 1 } },
			{ load: right, name: { symbol: 'F', suffix: 2 } },
		])
	})

	test('rejects conflicting points and duplicate complete names', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		expect(() => deriveLoadNames([force], [{ name: 'A', position: [0, 0] }, { name: 'B', position: [0, 0] }])).toThrow()
		expect(() => deriveLoadNames([force], [{ name: 'A', position: [0, 0] }, { name: 'A', position: [1, 0] }])).toThrow()
		expect(() => deriveLoadNames([force], [], [
			{ load: force, name: { symbol: 'F', point: 'A' } },
			{ load: force, name: { symbol: 'F', suffix: 'A' } },
		])).toThrow()
	})
})
