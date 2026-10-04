import { Transformation } from '@step-wise/geometry'
import { describe, expect, test } from 'vitest'

import { DrawingCoordinateSystem } from '../transforms/index.ts'

import { resolveDistance } from './distances.ts'

describe('resolveDistance', () => {
	test('scales bare drawing distances by the geometric mean scale', () => {
		const coordinateSystem = createCoordinateSystem()

		expect(resolveDistance(3, coordinateSystem)).toBe(12)
	})

	test('combines drawing distances and pixel offsets', () => {
		const coordinateSystem = createCoordinateSystem()

		expect(resolveDistance({ distance: 3, pixelOffset: 2 }, coordinateSystem)).toBe(14)
	})

	test('keeps direct pixel distances unchanged', () => {
		const coordinateSystem = createCoordinateSystem()

		expect(resolveDistance({ pixelDistance: 20 }, coordinateSystem)).toBe(20)
	})

	test('rejects ambiguous and malformed distances', () => {
		const coordinateSystem = createCoordinateSystem()

		expect(() => resolveDistance({ distance: 1, pixelDistance: 2 }, coordinateSystem)).toThrow('exactly one')
		expect(() => resolveDistance({} as never, coordinateSystem)).toThrow('exactly one')
	})
})

function createCoordinateSystem() {
	return new DrawingCoordinateSystem({
		width: 100,
		height: 100,
		drawingToPixelTransformation: Transformation.fromScale([2, 8]),
	})
}
