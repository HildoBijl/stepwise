import { Rectangle } from '@step-wise/geometry'
import { describe, expect, test } from 'vitest'

import { Bounds } from './Bounds.ts'

describe('Bounds', () => {
	test('exposes direction-independent rectangle properties', () => {
		const bounds = new Bounds(new Rectangle([10, 20], [40, 60]), 'down')

		expect(bounds.min.coordinates).toEqual([10, 20])
		expect(bounds.max.coordinates).toEqual([40, 60])
		expect(bounds.size.coordinates).toEqual([30, 40])
		expect(bounds.center.coordinates).toEqual([25, 40])
		expect(bounds).toMatchObject({ minX: 10, maxX: 40, minY: 20, maxY: 60, width: 30, height: 40 })
	})

	test('uses the minimum y-coordinate as the top when y points down', () => {
		const bounds = new Bounds(new Rectangle([10, 20], [40, 60]), 'down')

		expect(bounds.top).toBe(20)
		expect(bounds.bottom).toBe(60)
		expect(bounds.topLeft.coordinates).toEqual([10, 20])
		expect(bounds.bottomRight.coordinates).toEqual([40, 60])
		expect(bounds.getAnchor('right').coordinates).toEqual([40, 40])
	})

	test('uses the maximum y-coordinate as the top when y points up', () => {
		const bounds = new Bounds(new Rectangle([10, 20], [40, 60]), 'up')

		expect(bounds.top).toBe(60)
		expect(bounds.bottom).toBe(20)
		expect(bounds.topRight.coordinates).toEqual([40, 60])
		expect(bounds.bottomLeft.coordinates).toEqual([10, 20])
		expect(bounds.getAnchor('bottom').coordinates).toEqual([25, 20])
	})

	test('rejects non-two-dimensional rectangles', () => {
		expect(() => new Bounds(new Rectangle([0, 0, 0], [1, 1, 1]), 'up')).toThrow('expected a two-dimensional rectangle')
	})
})
