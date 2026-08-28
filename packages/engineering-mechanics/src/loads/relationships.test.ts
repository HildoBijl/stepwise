import { describe, expect, it } from 'vitest'

import { createForce, createMoment } from './creation.ts'
import { isLoadAtPoint } from './relationships.ts'

describe('load relationships', () => {
	it('checks force and moment application points', () => {
		expect(isLoadAtPoint(createForce({ position: [1, 2], angle: 0 }), [1, 2])).toBe(true)
		expect(isLoadAtPoint(createMoment({ position: [1, 2], clockwise: true }), [2, 1])).toBe(false)
	})

	it('uses tolerant vector equality and enforces dimensions', () => {
		const force = createForce({ position: [1, 2], angle: 0 })
		expect(isLoadAtPoint(force, [1 + Number.EPSILON, 2])).toBe(true)
		expect(() => isLoadAtPoint(force, [1, 2, 3])).toThrow()
	})
})
