import { Vector } from '@step-wise/geometry'

import { isForce, isMoment } from './checks'
import { createForce, createLoad, createMoment } from './creation'
import { serializeForce, serializeLoad, deserializeForce, deserializeLoad } from './serialization'
import { isLoadAtPoint } from './relationships'
import { reverseForce, reverseMoment, decomposeForceIntoAxisComponents } from './manipulation'
import { compareLoads, loadsEqual } from './comparison'
import { defaultLoadComparisonOptions, resolveLoadComparisonOptions } from './comparisonOptions'
import { compareLoadLists } from './matching'

describe('loads', () => {
	describe('creation and validation', () => {
		test('creates canonical forces', () => {
			const force = createForce({ position: [1, 2], angle: -Math.PI / 2 })
			expect(isForce(force)).toBe(true)
			expect(force.position).toEqual(new Vector(1, 2))
			expect(force.angle).toBe(3 * Math.PI / 2)
			expect(force.applicationPointAt).toBe('end')
			expect(force.relativeMagnitude).toBe(1)
		})

		test('creates canonical moments', () => {
			const moment = createMoment({ position: [1, 2], clockwise: true, openingDirection: -Math.PI / 2 })
			expect(isMoment(moment)).toBe(true)
			expect(moment.position).toEqual(new Vector(1, 2))
			expect(moment.clockwise).toBe(true)
			expect(moment.openingDirection).toBe(3 * Math.PI / 2)
		})

		test('rejects invalid runtime values and freezes canonical loads', () => {
			const mutableForce = { type: 'Force' as const, position: new Vector(1, 2), angle: 0, applicationPointAt: 'end' as const, relativeMagnitude: 1 }
			const force = createLoad(mutableForce)
			expect(force).not.toBe(mutableForce)
			expect(Object.isFrozen(force)).toBe(true)
			expect(isForce({ ...force, angle: NaN })).toBe(false)
			expect(isMoment({ ...createMoment({ position: [0, 0], clockwise: true }), openingDirection: NaN })).toBe(false)
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
			const force = createForce({ position: Vector.zero, angle: 7 * Math.PI / 4, relativeMagnitude: 2 })
			const components = decomposeForceIntoAxisComponents(force)
			expect(components.every(isForce)).toBe(true)
			expect(components.map(component => component.angle)).toEqual([0, 3 * Math.PI / 2])
			expect(components.map(component => component.relativeMagnitude)).toEqual([
				2 * Math.abs(Math.cos(force.angle)),
				2 * Math.abs(Math.sin(force.angle)),
			])
		})

		test('omits zero axis components', () => {
			const force = createForce({ position: Vector.zero, angle: 0, relativeMagnitude: 2 })
			expect(decomposeForceIntoAxisComponents(force)).toEqual([force])
		})
	})

	describe('comparison', () => {
		test('compares force directions and lines', () => {
			const input = createForce({ position: [1, 0], angle: Math.PI })
			const solution = createForce({ position: [0, 0], angle: 0, relativeMagnitude: 2 })
			expect(loadsEqual(input, solution)).toBe(false)
			expect(loadsEqual(input, solution, { force: { position: 'sameLine', direction: 'parallel', applicationPointAt: 'ignore' } })).toBe(true)
		})

		test('compares moment directions and opening directions', () => {
			const input = createMoment({ position: Vector.zero, clockwise: true, openingDirection: 0 })
			const solution = createMoment({ position: Vector.zero, clockwise: true, openingDirection: Math.PI })
			expect(loadsEqual(input, solution, { moment: { openingDirection: 'ignore' } })).toBe(true)
			expect(compareLoads(input, solution)).toEqual({ equal: false, differences: [{ type: 'openingDirection', comparison: 'equal' }] })
		})
	})

	describe('load lists', () => {
		test('matches reordered sets one-to-one', () => {
			const force = createForce({ position: Vector.zero, angle: 0 })
			const moment = createMoment({ position: [1, 0], clockwise: true })
			expect(compareLoadLists([force, moment], [moment, force]).equal).toBe(true)
			expect(compareLoadLists([force], [force, force]).equal).toBe(false)
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
			expect(Object.isFrozen(defaultLoadComparisonOptions)).toBe(true)
			expect(Object.isFrozen(defaultLoadComparisonOptions.force)).toBe(true)
			const options = resolveLoadComparisonOptions({ force: { direction: 'parallel' } })
			expect(Object.isFrozen(options)).toBe(true)
			expect(Object.isFrozen(options.force)).toBe(true)
		})
	})
})
