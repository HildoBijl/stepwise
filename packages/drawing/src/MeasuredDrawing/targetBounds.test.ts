import { describe, expect, test } from 'vitest'

import { Rectangle } from '@step-wise/geometry'

import { DrawingCoordinateSystem } from '../transforms/index.ts'

import { resolveTargetRectanglesRecord, toTargetBoundsRecord } from './targetBounds.ts'

describe('target bounds', () => {
	test('resolves rectangles and bounds by target name', () => {
		const first = new Rectangle([10, 20], [30, 50])
		const second = new Rectangle([40, 60], [80, 90])
		const rectangles = resolveTargetRectanglesRecord(['first', 'second'], new Map([['first', first], ['second', second]]))!
		const bounds = toTargetBoundsRecord(rectangles, new DrawingCoordinateSystem({ width: 100, height: 100 }))

		expect(rectangles).toEqual({ first, second })
		expect(bounds.first.left).toBe(10)
		expect(bounds.second.bottom).toBe(90)
	})

	test('uses upward pixel coordinates when the y-direction points up', () => {
		const rectangles = resolveTargetRectanglesRecord(['target'], new Map([['target', new Rectangle([10, 20], [30, 50])]]))!
		const bounds = toTargetBoundsRecord(rectangles, new DrawingCoordinateSystem({ width: 100, height: 100, yDirection: 'up' })).target

		expect([bounds.rectangle.min.y, bounds.rectangle.max.y]).toEqual([50, 80])
		expect([bounds.top, bounds.bottom]).toEqual([80, 50])
	})

	test('rejects duplicate target names before resolving their bounds', () => {
		expect(() => resolveTargetRectanglesRecord(['repeated', 'repeated'], new Map())).toThrow('target "repeated" occurs more than once')
	})
})
