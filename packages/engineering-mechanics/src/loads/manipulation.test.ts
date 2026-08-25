import { describe, expect, it } from 'vitest'

import { createForce, createMoment, decomposeForceIntoAxisComponents, reverseForce, reverseLoad, reverseMoment } from '../..'

describe('load manipulation', () => {
	it('reverses forces while preserving their other properties', () => {
		const force = createForce({ position: [1, 2], angle: 3 * Math.PI / 2, applicationPointAt: 'start', relativeMagnitude: 2 })
		expect(reverseForce(force)).toEqual({ ...force, angle: Math.PI / 2 })
		expect(reverseLoad(force)).toEqual(reverseForce(force))
	})

	it('reverses moments while preserving their opening direction', () => {
		const moment = createMoment({ position: [1, 2], clockwise: false, openingDirection: Math.PI })
		expect(reverseMoment(moment)).toEqual({ ...moment, clockwise: true })
		expect(reverseLoad(moment)).toEqual(reverseMoment(moment))
	})

	it('decomposes diagonal forces in every quadrant', () => {
		for (const angle of [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4]) {
			const components = decomposeForceIntoAxisComponents(createForce({ position: [0, 0], angle, relativeMagnitude: 2 }))
			expect(components).toHaveLength(2)
			expect(components.every(component => Object.isFrozen(component))).toBe(true)
			components.forEach(component => expect(component.relativeMagnitude).toBeCloseTo(Math.SQRT2))
		}
	})

	it('omits zero and floating-point-noise components', () => {
		for (const angle of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
			expect(decomposeForceIntoAxisComponents(createForce({ position: [0, 0], angle }))).toHaveLength(1)
		}
	})
})
