import { describe, expect, it } from 'vitest'

import { createForce, createMoment } from './creation.ts'
import { compareForces, compareLoads, compareMoments, loadsEqual } from './comparison.ts'

describe('load comparison', () => {
	it('compares force positions using equal, sameLine, and ignore', () => {
		const solution = createForce({ position: [0, 0], angle: 0 })
		const shifted = createForce({ position: [2, 0], angle: 0 })
		expect(loadsEqual(shifted, solution)).toBe(false)
		expect(loadsEqual(shifted, solution, { force: { position: 'sameLine' } })).toBe(true)
		expect(loadsEqual(createForce({ position: [0, 2], angle: 0 }), solution, { force: { position: 'ignore' } })).toBe(true)
	})

	it('compares force direction and application-point placement', () => {
		const solution = createForce({ position: [0, 0], angle: 0, applicationPointAt: 'end' })
		const reverse = createForce({ position: [0, 0], angle: Math.PI, applicationPointAt: 'start' })
		expect(loadsEqual(reverse, solution, { force: { direction: 'parallel', applicationPointAt: 'ignore' } })).toBe(true)
		expect(compareForces(reverse, solution).differences.map(({ type }) => type)).toEqual(['direction', 'applicationPointAt'])
	})

	it('does not compare relative graphical magnitude', () => {
		const a = createForce({ position: [0, 0], angle: 0, relativeMagnitude: 1 })
		const b = createForce({ position: [0, 0], angle: 0, relativeMagnitude: 4 })
		expect(loadsEqual(a, b)).toBe(true)
	})

	it('compares all moment properties', () => {
		const solution = createMoment({ position: [0, 0], clockwise: true, openingDirection: 0 })
		const input = createMoment({ position: [1, 0], clockwise: false, openingDirection: Math.PI })
		expect(compareMoments(input, solution).differences.map(({ type }) => type)).toEqual(['position', 'direction', 'openingDirection'])
		expect(loadsEqual(input, solution, { moment: { position: 'ignore', direction: 'ignore', openingDirection: 'ignore' } })).toBe(true)
	})

	it('compares wrapped angles tolerantly', () => {
		const a = createForce({ position: [0, 0], angle: Number.EPSILON })
		const b = createForce({ position: [0, 0], angle: 2 * Math.PI - Number.EPSILON })
		expect(loadsEqual(a, b)).toBe(true)
	})

	it('reports differing load types', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		const moment = createMoment({ position: [0, 0], clockwise: true })
		expect(compareLoads(force, moment)).toEqual({ equal: false, differences: [{ type: 'loadType', input: 'Force', solution: 'Moment' }] })
		expect(loadsEqual(force, moment)).toBe(false)
	})
})
