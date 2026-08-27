import { describe, expect, it } from 'vitest'

import { createForce, createMoment } from '../loads'

import { deriveLoadNames } from './nameDerivation'

describe('load-name derivation', () => {
	it('names single forces and moments at named points', () => {
		const force = createForce({ position: [1, 2], angle: 0 })
		const moment = createMoment({ position: [1, 2], clockwise: true })
		expect(deriveLoadNames([force, moment], [{ name: 'A', position: [1, 2] }]).map(({ name }) => name)).toEqual([
			{ symbol: 'F', point: 'A' },
			{ symbol: 'M', point: 'A' },
		])
	})

	it('uses x and y suffixes for one horizontal and one vertical force', () => {
		const vertical = createForce({ position: [0, 0], angle: 3 * Math.PI / 2 })
		const horizontal = createForce({ position: [0, 0], angle: Math.PI })
		expect(deriveLoadNames([vertical, horizontal], [{ name: 'A', position: [0, 0] }]).map(({ name }) => name)).toEqual([
			{ symbol: 'F', point: 'A', suffix: 'x' },
			{ symbol: 'F', point: 'A', suffix: 'y' },
		])
	})

	it('numbers forces and moments in deterministic direction order', () => {
		const right = createForce({ position: [0, 0], angle: 0 })
		const diagonal = createForce({ position: [0, 0], angle: Math.PI / 4 })
		const counterclockwise = createMoment({ position: [1, 0], clockwise: false, openingDirection: Math.PI })
		const clockwise = createMoment({ position: [1, 0], clockwise: true, openingDirection: Math.PI / 2 })
		const names = deriveLoadNames([diagonal, right, counterclockwise, clockwise], [{ name: 'A', position: [0, 0] }, { name: 'B', position: [1, 0] }]).map(({ name }) => name)
		expect(names).toEqual([
			{ symbol: 'F', point: 'A', suffix: 1 },
			{ symbol: 'F', point: 'A', suffix: 2 },
			{ symbol: 'M', point: 'B', suffix: 1 },
			{ symbol: 'M', point: 'B', suffix: 2 },
		])
	})

	it('names unattached loads and supports custom symbols', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		const moment = createMoment({ position: [1, 0], clockwise: true })
		expect(deriveLoadNames([force, moment], [], [], { forceSymbol: 'P', momentSymbol: 'T' }).map(({ name }) => name)).toEqual([{ symbol: 'P' }, { symbol: 'T' }])
	})

	it('reuses predefined names with configurable matching', () => {
		const input = createForce({ position: [2, 0], angle: Math.PI })
		const predefined = createForce({ position: [0, 0], angle: 0 })
		const result = deriveLoadNames([input], [], [{ load: predefined, name: { symbol: 'P' } }], { predefinedLoadComparison: { force: { position: 'sameLine', direction: 'parallel' } } })
		expect(result).toEqual([{ load: input, name: { symbol: 'P' } }])
		expect(result[0]?.load).toBe(input)
	})

	it('matches each input load and predefined name at most once', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		const result = deriveLoadNames([force, force], [], [{ load: force, name: { symbol: 'P' } }])
		expect(result.map(({ name }) => name)).toEqual([{ symbol: 'P' }, { symbol: 'F' }])
		expect(deriveLoadNames([force], [], [{ load: createForce({ position: [1, 0], angle: Math.PI / 2 }), name: { symbol: 'Q' } }])[0]?.name).toEqual({ symbol: 'F' })
	})

	it('rejects conflicting points and duplicate rendered names', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		expect(() => deriveLoadNames([force], [{ name: 'A', position: [0, 0] }, { name: 'B', position: [0, 0] }])).toThrow()
		expect(() => deriveLoadNames([force], [{ name: 'A', position: [0, 0] }, { name: 'A', position: [1, 0] }])).toThrow()
		expect(() => deriveLoadNames([force], [], [
			{ load: force, name: { symbol: 'F', point: 'A' } },
			{ load: force, name: { symbol: 'F', suffix: 'A' } },
		])).toThrow()
	})

	it('returns frozen canonical objects', () => {
		const [namedLoad] = deriveLoadNames([createForce({ position: [0, 0], angle: 0 })])
		expect(Object.isFrozen(namedLoad)).toBe(true)
		expect(Object.isFrozen(namedLoad?.load)).toBe(true)
		expect(Object.isFrozen(namedLoad?.name)).toBe(true)
	})
})
