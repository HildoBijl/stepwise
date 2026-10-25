import { describe, expect, test, vi } from 'vitest'

import { Rectangle, Transformation } from '@step-wise/geometry'

import { DrawingCoordinateSystem } from '../transforms/index.ts'

import { getDistanceTargets, resolveDistance } from './distances.ts'

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

	test('calculates distances from recursively resolved positions', () => {
		const coordinateSystem = createCoordinateSystem()
		const distance = resolveDistance({
			positions: [
				{ pixelPosition: [10, 20] },
				{ positions: [{ pixelPosition: [40, 60] }], calculate: ([position]) => position },
			],
			calculate: ([first, second]) => second.subtract(first).magnitude,
		}, coordinateSystem)

		expect(distance).toBe(50)
	})

	test('does not calculate a distance until every position is resolved', () => {
		const calculate = vi.fn(() => 0)

		expect(resolveDistance({ positions: [{ target: 'missing' }], calculate }, createCoordinateSystem())).toBeUndefined()
		expect(calculate).not.toHaveBeenCalled()
	})

	test('resolves target positions and collects their names recursively', () => {
		const coordinateSystem = createCoordinateSystem()
		const distance = {
			positions: [
				{ target: 'first' },
				{ positions: [{ target: 'second' }, { target: 'first' }], calculate: ([position]) => position },
			],
			calculate: ([first, second]) => second.subtract(first).magnitude,
		} as const
		const getTargetBounds = (target: string) => target === 'first' ? new Rectangle([0, 0], [10, 10]) : new Rectangle([30, 40], [40, 50])

		expect(getDistanceTargets(distance)).toEqual(['first', 'second'])
		expect(resolveDistance(distance, coordinateSystem, getTargetBounds)).toBe(50)
	})

	test('rejects ambiguous and malformed distances', () => {
		const coordinateSystem = createCoordinateSystem()

		expect(() => resolveDistance({ distance: 1, pixelDistance: 2 }, coordinateSystem)).toThrow('exactly one')
		expect(() => resolveDistance({} as never, coordinateSystem)).toThrow('exactly one')
		expect(() => resolveDistance({ positions: [], calculate: () => 0 }, coordinateSystem)).toThrow('non-empty')
	})
})

function createCoordinateSystem() {
	return new DrawingCoordinateSystem({
		width: 100,
		height: 100,
		drawingToPixelTransformation: Transformation.fromScale([2, 8]),
	})
}
