import { Vector } from '@step-wise/geometry'

import { createForce, createMoment } from '../loads'

import { createLoadName } from './creation'
import { isLoadName, isNamedLoad } from './validation'
import { getLoadNameSubscript } from './formatting'
import { deriveLoadNames } from './derivation'

describe('named loads', () => {
	test('creates, validates and formats structured load names', () => {
		const name = createLoadName({ symbol: 'F', point: 'A', suffix: 'x' })
		expect(isLoadName(name)).toBe(true)
		expect(getLoadNameSubscript(name)).toBe('Ax')
		expect(getLoadNameSubscript({ symbol: 'M' })).toBeUndefined()
		expect(() => createLoadName({ symbol: '', point: 'A' })).toThrow()
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
		const [namedLoad] = deriveLoadNames([input], [], [{ load: predefined, name: { symbol: 'P' } }], { predefinedComparison: { Force: { direction: 'parallel' } } })
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
})
