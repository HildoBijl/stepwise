import { describe, expect, it } from 'vitest'

import { anglesEqual, degreesToRadians, normalizeAngle, radiansToDegrees } from './angles'

describe('angle utilities', () => {
	it('converts between degrees and radians', () => {
		expect(degreesToRadians(180)).toBeCloseTo(Math.PI)
		expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90)
	})

	it('normalizes angles to the requested period', () => {
		expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(3 * Math.PI / 2)
		expect(normalizeAngle(9, 4)).toBe(1)
	})

	it('compares angles modulo a period', () => {
		expect(anglesEqual(0, 2 * Math.PI)).toBe(true)
		expect(anglesEqual(1, 5, 4)).toBe(true)
		expect(anglesEqual(0, Math.PI)).toBe(false)
	})
})
