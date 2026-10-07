import { describe, expect, it } from 'vitest'

import { resolvePlot, resolvePlotView } from './resolution.ts'

describe('Plot resolution', () => {
	it('derives and extends domains with useful ticks', () => {
		const { axes: { x: axis } } = resolvePlot({ min: [1.1, -4], max: [8.2, 4] }, undefined, { x: { includeZero: false, ticks: { desiredCount: 5 } } })
		expect(axis.domain).toEqual([0, 10])
		expect(axis.ticks).toEqual([0, 2, 4, 6, 8, 10])
		expect(axis.position).toBe(0)
	})

	it('supports explicit domains and ticks without extending the domain', () => {
		const { axes: { x: axis } } = resolvePlot({ min: [2, 10], max: [3, 20] }, undefined, {
			x: { domain: [-1, 1], includeZero: false, position: 'min', ticks: { values: [-2, -1, 0, 1, 2], extendDomain: false } },
			y: { includeZero: false, ticks: { values: [10, 20], extendDomain: false } },
		})
		expect(axis.domain).toEqual([-1, 1])
		expect(axis.ticks).toEqual([-1, 0, 1])
		expect(axis.position).toBe(10)
	})

	it('derives bounds from points and turns Plot views into upward Drawing views', () => {
		const plot = resolvePlot(undefined, [[-2, 1], [4, 5]], { x: { includeZero: false }, y: { includeZero: false } })
		expect(plot.domain.min.toStorageValue()).toEqual([-2, 1])
		expect(plot.domain.max.toStorageValue()).toEqual([4, 5])
		expect(resolvePlotView({ type: 'fit', maxWidth: 600, maxHeight: 400 }, plot.domain)).toMatchObject({ type: 'fit', uniform: false, yDirection: 'up' })
	})
})
