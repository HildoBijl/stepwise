import { describe, expect, it } from 'vitest'

import { ForceType, MomentType } from './types.ts'
import { isForce, isLoad, isMoment } from './checks.ts'
import { createForce, createLoad, createMoment } from './creation.ts'

describe('load creation and checks', () => {
	it('creates canonical forces with defaults and normalized angles', () => {
		const force = createForce({ position: [1, 2], angle: -Math.PI / 2 })
		expect(force).toMatchObject({ type: ForceType, angle: 3 * Math.PI / 2, applicationPointAt: 'end', relativeMagnitude: 1 })
		expect(force.position.coordinates).toEqual([1, 2])
		expect(isForce(force)).toBe(true)
		expect(Object.isFrozen(force)).toBe(true)
	})

	it('creates canonical moments with defaults and normalized directions', () => {
		const moment = createMoment({ position: [1, 2], clockwise: true, openingDirection: -Math.PI / 2 })
		expect(moment).toMatchObject({ type: MomentType, clockwise: true, openingDirection: 3 * Math.PI / 2 })
		expect(isMoment(moment)).toBe(true)
		expect(Object.isFrozen(moment)).toBe(true)
	})

	it('dispatches general loads and reuses frozen canonical values', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		const moment = createMoment({ position: [0, 0], clockwise: false })
		expect(createLoad(force)).toBe(force)
		expect(createLoad(moment)).toBe(moment)
		expect(isLoad(force)).toBe(true)
		expect(isLoad(moment)).toBe(true)
	})

	it('copies mutable canonical-looking input', () => {
		const input = { type: ForceType, position: createForce({ position: [0, 0], angle: 0 }).position, angle: 0, applicationPointAt: 'end' as const, relativeMagnitude: 1 }
		expect(createLoad(input)).not.toBe(input)
	})

	it('rejects invalid runtime input', () => {
		expect(() => createForce({ position: [0, 0, 0], angle: 0 })).toThrow()
		expect(() => createForce({ position: [0, 0], angle: 0, applicationPointAt: 'middle' as never })).toThrow()
		expect(() => createForce({ position: [0, 0], angle: 0, relativeMagnitude: 0 })).toThrow()
		expect(() => createMoment({ position: [0, 0], clockwise: 'yes' as never })).toThrow()
		expect(() => createLoad({ type: 'Unknown' } as never)).toThrow()
	})

	it('guards reject malformed and non-finite values', () => {
		const force = createForce({ position: [0, 0], angle: 0 })
		const moment = createMoment({ position: [0, 0], clockwise: true })
		expect(isForce({ ...force, angle: NaN })).toBe(false)
		expect(isForce({ ...force, relativeMagnitude: Infinity })).toBe(false)
		expect(isMoment({ ...moment, openingDirection: NaN })).toBe(false)
		expect(isLoad({ ...force, type: 'Unknown' })).toBe(false)
	})
})
