import { Transformation } from '@step-wise/geometry'
import { describe, expect, test } from 'vitest'

import { DrawingCoordinateSystem } from '../transforms/index.ts'

import { resolvePosition } from './positions.ts'

describe('resolvePosition', () => {
	test('interprets a bare vector as a drawing position', () => {
		const coordinateSystem = createCoordinateSystem('up')

		expect(resolvePosition([10, 5], coordinateSystem).coordinates).toEqual([20, 60])
	})

	test('adds pixel offsets using the configured pixel-coordinate direction', () => {
		const coordinateSystem = createCoordinateSystem('up')

		expect(resolvePosition({ position: [10, 5], pixelOffset: [5, 10] }, coordinateSystem).coordinates).toEqual([25, 50])
	})

	test('converts direct pixel positions to render coordinates', () => {
		const coordinateSystem = createCoordinateSystem('up')

		expect(resolvePosition({ pixelPosition: [10, 20] }, coordinateSystem).coordinates).toEqual([10, 80])
	})

	test('rejects ambiguous and malformed positions', () => {
		const coordinateSystem = createCoordinateSystem('down')

		expect(() => resolvePosition({ position: [1, 2], pixelPosition: [3, 4] }, coordinateSystem)).toThrow('exactly one')
		expect(() => resolvePosition({} as never, coordinateSystem)).toThrow('exactly one')
		expect(() => resolvePosition([1, 2, 3], coordinateSystem)).toThrow('dimension')
	})
})

function createCoordinateSystem(yDirection: 'up' | 'down') {
	return new DrawingCoordinateSystem({
		width: 100,
		height: 100,
		yDirection,
		drawingToPixelTransformation: Transformation.fromScale([2, 8]),
	})
}
