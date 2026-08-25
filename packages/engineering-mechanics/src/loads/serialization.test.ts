import { describe, expect, it } from 'vitest'

import { createForce, createMoment, deserializeForce, deserializeLoad, deserializeMoment, serializeForce, serializeLoad, serializeMoment } from '../..'

describe('load serialization', () => {
	it('round-trips forces and moments', () => {
		const force = createForce({ position: [2, 3], angle: Math.PI / 3, applicationPointAt: 'start', relativeMagnitude: 2 })
		const moment = createMoment({ position: [4, 5], clockwise: true, openingDirection: Math.PI })
		expect(deserializeForce(serializeForce(force))).toEqual(force)
		expect(deserializeMoment(serializeMoment(moment))).toEqual(moment)
		expect(deserializeLoad(serializeLoad(force))).toEqual(force)
		expect(deserializeLoad(serializeLoad(moment))).toEqual(moment)
	})

	it('rejects missing, additional, and malformed force data', () => {
		const force = serializeForce(createForce({ position: [0, 0], angle: 0 }))
		expect(() => deserializeForce({ ...force, extra: true })).toThrow()
		expect(() => deserializeForce({ ...force, position: [0, 0, 0] })).toThrow()
		expect(() => deserializeForce({ ...force, angle: NaN })).toThrow()
		expect(() => deserializeForce({ ...force, applicationPointAt: undefined })).toThrow()
		expect(() => deserializeForce({ ...force, relativeMagnitude: 0 })).toThrow()
	})

	it('rejects malformed moment data and unknown load types', () => {
		const moment = serializeMoment(createMoment({ position: [0, 0], clockwise: true }))
		expect(() => deserializeMoment({ ...moment, clockwise: 1 })).toThrow()
		expect(() => deserializeMoment({ ...moment, openingDirection: Infinity })).toThrow()
		expect(() => deserializeLoad({ ...moment, type: 'Unknown' })).toThrow()
		expect(() => deserializeLoad(null)).toThrow()
	})
})
