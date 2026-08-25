import { Vector } from '@step-wise/geometry'

import { isForce, isMoment } from './validation'
import { createForce, createLoad, createMoment } from './creation'
import { serializeForce, serializeLoad, deserializeForce, deserializeLoad } from './serialization'
import { isLoadAtPoint } from './checks'
import { reverseForce, reverseMoment, getAxisComponents } from './manipulation'
import { compareLoads, equalLoads } from './comparison'
import { defaultLoadComparison, resolveLoadComparisonOptions } from './comparisonOptions'
import { compareLoadSets } from './matching'

describe('loads', () => {
	describe('creation and validation', () => {
		test('creates canonical forces', () => {
			const force = createForce({ position: [1, 2], angle: -Math.PI / 2 })
			expect(isForce(force)).toBe(true)
			expect(force.position).toEqual(new Vector(1, 2))
			expect(force.angle).toBe(3 * Math.PI / 2)
			expect(force.applicationPointAt).toBe('end')
			expect(force.magnitudeFactor).toBe(1)
		})

		test('creates canonical moments', () => {
			const moment = createMoment({ position: [1, 2], clockwise: true, openingAngle: -Math.PI / 2 })
			expect(isMoment(moment)).toBe(true)
			expect(moment.position).toEqual(new Vector(1, 2))
			expect(moment.clockwise).toBe(true)
			expect(moment.openingAngle).toBe(3 * Math.PI / 2)
		})

		test('rejects invalid runtime values and freezes canonical loads', () => {
			const mutableForce = { type: 'Force' as const, position: new Vector(1, 2), angle: 0, applicationPointAt: 'end' as const, magnitudeFactor: 1 }
			const force = createLoad(mutableForce)
			expect(force).not.toBe(mutableForce)
			expect(Object.isFrozen(force)).toBe(true)
			expect(isForce({ ...force, angle: NaN })).toBe(false)
			expect(isMoment({ ...createMoment({ position: [0, 0], clockwise: true }), openingAngle: NaN })).toBe(false)
			expect(() => createMoment({ position: [0, 0], clockwise: 'yes' as unknown as boolean })).toThrow()
			expect(() => createLoad({ type: 'Unknown' } as never)).toThrow()
		})
	})

	describe('manipulation', () => {
		test('reverses forces and moments', () => {
			const force = reverseForce(createForce({ position: Vector.zero, angle: 3 * Math.PI / 2 }))
			const moment = reverseMoment(createMoment({ position: Vector.zero, clockwise: false }))
			expect(isForce(force)).toBe(true)
			expect(force.angle).toBe(Math.PI / 2)
			expect(isMoment(moment)).toBe(true)
			expect(moment.clockwise).toBe(true)
		})

		test('returns valid axis components', () => {
			const force = createForce({ position: Vector.zero, angle: 7 * Math.PI / 4, magnitudeFactor: 2 })
			const components = getAxisComponents(force)
			expect(components.every(isForce)).toBe(true)
			expect(components.map(component => component.angle)).toEqual([0, 3 * Math.PI / 2])
			expect(components.map(component => component.magnitudeFactor)).toEqual([
				2 * Math.abs(Math.cos(force.angle)),
				2 * Math.abs(Math.sin(force.angle)),
			])
		})

		test('omits zero axis components', () => {
			const force = createForce({ position: Vector.zero, angle: 0, magnitudeFactor: 2 })
			expect(getAxisComponents(force)).toEqual([force])
		})
	})

	describe('comparison', () => {
		test('compares force directions and lines', () => {
			const input = createForce({ position: [1, 0], angle: Math.PI })
			const solution = createForce({ position: [0, 0], angle: 0, magnitudeFactor: 2 })
			expect(equalLoads(input, solution)).toBe(false)
			expect(equalLoads(input, solution, { Force: { position: 'equalLine', direction: 'parallel', applicationPointAt: 'ignore' } })).toBe(true)
		})

		test('compares moment directions and opening angles', () => {
			const input = createMoment({ position: Vector.zero, clockwise: true, openingAngle: 0 })
			const solution = createMoment({ position: Vector.zero, clockwise: true, openingAngle: Math.PI })
			expect(equalLoads(input, solution, { Moment: { openingAngle: 'ignore' } })).toBe(true)
			expect(compareLoads(input, solution)).toEqual({ equal: false, differences: [{ type: 'openingAngle', comparison: 'equal' }] })
		})
	})

	describe('load sets', () => {
		test('matches reordered sets one-to-one', () => {
			const force = createForce({ position: Vector.zero, angle: 0 })
			const moment = createMoment({ position: [1, 0], clockwise: true })
			expect(compareLoadSets([force, moment], [moment, force]).equal).toBe(true)
			expect(compareLoadSets([force], [force, force]).equal).toBe(false)
		})
	})

	describe('serialization and checks', () => {
		test('round-trips loads and checks their application position', () => {
			const force = createForce({ position: [2, 3], angle: Math.PI / 3, applicationPointAt: 'start' })
			const deserialized = deserializeLoad(serializeLoad(force))
			expect(deserialized).toEqual(force)
			expect(isLoadAtPoint(deserialized, [2, 3])).toBe(true)
			expect(isLoadAtPoint(deserialized, [3, 3])).toBe(false)
		})

		test('strictly rejects malformed serialized loads', () => {
			const serialized = serializeForce(createForce({ position: [2, 3], angle: 0 }))
			expect(deserializeForce(serialized)).toEqual(createForce({ position: [2, 3], angle: 0 }))
			expect(() => deserializeForce({ ...serialized, extra: true })).toThrow()
			expect(() => deserializeForce({ ...serialized, angle: NaN })).toThrow()
			expect(() => deserializeLoad({ ...serialized, type: 'Unknown' })).toThrow()
		})
	})

	describe('comparison options', () => {
		test('returns frozen defaults and resolved options', () => {
			expect(Object.isFrozen(defaultLoadComparison)).toBe(true)
			expect(Object.isFrozen(defaultLoadComparison.Force)).toBe(true)
			const options = resolveLoadComparisonOptions({ Force: { direction: 'parallel' } })
			expect(Object.isFrozen(options)).toBe(true)
			expect(Object.isFrozen(options.Force)).toBe(true)
		})
	})
})
