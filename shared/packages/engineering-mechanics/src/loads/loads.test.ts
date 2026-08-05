import { Vector } from '@step-wise/geometry'

import { isForce, isMoment } from './validation'
import { createForce, createMoment } from './creation'
import { serializeLoad, deserializeLoad } from './serialization'
import { isLoadAtPoint } from './checks'
import { reverseForce, reverseMoment, getAxisComponents } from './manipulation'
import { compareLoads, equalLoads } from './comparison'
import { compareLoadSets } from './matching'

describe('loads', () => {
	describe('creation and validation', () => {
		test('creates canonical forces', () => {
			const force = createForce({ position: [1, 2], angle: -Math.PI / 2 })
			expect(isForce(force)).toBe(true)
			expect(force.position).toEqual(new Vector(1, 2))
			expect(force.angle).toBe(3 * Math.PI / 2)
			expect(force.applicationPointAt).toBe('end')
		})

		test('creates canonical moments', () => {
			const moment = createMoment({ position: [1, 2], clockwise: true, openingAngle: -Math.PI / 2 })
			expect(isMoment(moment)).toBe(true)
			expect(moment.position).toEqual(new Vector(1, 2))
			expect(moment.clockwise).toBe(true)
			expect(moment.openingAngle).toBe(3 * Math.PI / 2)
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
			const force = createForce({ position: Vector.zero, angle: 7 * Math.PI / 4 })
			const components = getAxisComponents(force)
			expect(components.every(isForce)).toBe(true)
			expect(components.map(component => component.angle)).toEqual([0, 3 * Math.PI / 2])
		})
	})

	describe('comparison', () => {
		test('compares force directions and lines', () => {
			const input = createForce({ position: [1, 0], angle: Math.PI })
			const solution = createForce({ position: [0, 0], angle: 0 })
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
	})
})
