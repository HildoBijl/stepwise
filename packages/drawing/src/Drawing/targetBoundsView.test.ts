import { describe, expect, test } from 'vitest'

import { Rectangle } from '@step-wise/geometry'

import { DrawingCoordinateSystem, resolveDrawingView } from '../transforms/index.ts'

import { getInitialViewBounds, getViewAroundTargetBounds } from './targetBoundsView.ts'

describe('target bounds views', () => {
	test('places the target union inside the requested margins', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 100, height: 100 })
		const view = getViewAroundTargetBounds(coordinates, [
			new Rectangle([-10, 20], [40, 60]),
			new Rectangle([30, 10], [50, 70]),
		], [[5, 10], [15, 20]])
		const resolved = resolveDrawingView(view)

		expect(resolved.width).toBe(75)
		expect(resolved.height).toBe(95)
		expect(resolved.drawingToRender([-10, 10]).coordinates).toEqual([5, 15])
		expect(resolved.drawingToRender([50, 70]).coordinates).toEqual([65, 75])
	})

	test('preserves the visual shift for upward-pointing coordinates', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 100, height: 100, yDirection: 'up' })
		const view = getViewAroundTargetBounds(coordinates, [new Rectangle([20, 30], [70, 80])], 10)
		const resolved = resolveDrawingView(view)

		expect(resolved.width).toBe(70)
		expect(resolved.height).toBe(70)
		expect(resolved.drawingToRender([25, 65]).coordinates).toEqual([15, 15])
	})

	test('maps initial view bounds into the current coordinate system', () => {
		const initial = new DrawingCoordinateSystem({ width: 100, height: 80 })
		const shifted = resolveDrawingView(getViewAroundTargetBounds(initial, [new Rectangle([20, 10], [70, 50])], 5))
		const initialBounds = getInitialViewBounds(shifted, initial)

		expect([initialBounds.min.x, initialBounds.min.y, initialBounds.max.x, initialBounds.max.y]).toEqual([-15, -5, 85, 75])
	})
})
