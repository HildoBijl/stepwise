import { describe, expect, test } from 'vitest'

import { Rectangle, Transformation } from '@step-wise/geometry'

import { resolveBoundsView, resolveCustomView, resolveDrawingView, resolveFitView, resolveScaleView } from './viewResolution.ts'

describe('Drawing view resolution', () => {
	test('resolves an identity view', () => {
		const coordinates = resolveDrawingView({ type: 'identity', width: 300, height: 200, yDirection: 'up' })

		expect(coordinates.width).toBe(300)
		expect(coordinates.height).toBe(200)
		expect(coordinates.yDirection).toBe('up')
		expect(coordinates.drawingToPixel([20, 30]).coordinates).toEqual([20, 30])
	})

	test('maps explicit bounds into exact dimensions and margins', () => {
		const coordinates = resolveBoundsView({
			type: 'bounds',
			bounds: new Rectangle([-2, -1], [2, 3]),
			width: 400,
			height: 200,
			margin: [[20, 20], [10, 10]],
		})

		expect(coordinates.drawingToPixel([-2, -1]).coordinates).toEqual([20, 10])
		expect(coordinates.drawingToPixel([2, 3]).coordinates).toEqual([380, 190])
	})

	test('resolves a fixed-scale view around its points', () => {
		const coordinates = resolveScaleView({
			type: 'scale',
			points: { start: [-1, -2], end: [3, 4] },
			scale: [10, 20],
			margin: [[5, 15], [10, 20]],
		})

		expect(coordinates.width).toBe(60)
		expect(coordinates.height).toBe(150)
		expect(coordinates.drawingToPixel([-1, -2]).coordinates).toEqual([5, 10])
		expect(coordinates.drawingToPixel([3, 4]).coordinates).toEqual([45, 130])
	})

	test('resolves a uniformly fitted view', () => {
		const coordinates = resolveFitView({
			type: 'fit',
			points: [[0, 0], [4, 2]],
			maxWidth: 220,
			maxHeight: 120,
			margin: 10,
		})

		expect(coordinates.width).toBe(220)
		expect(coordinates.height).toBe(120)
		expect(coordinates.drawingVectorToPixel([1, 1]).coordinates).toEqual([50, 50])
	})

	test('applies a pretransform before fitting and positioning points', () => {
		const coordinates = resolveScaleView({
			type: 'scale',
			points: [[0, 0], [2, 1]],
			scale: 10,
			margin: 5,
			pretransform: Transformation.verticalFlip,
		})

		expect(coordinates.drawingToPixel([0, 0]).coordinates).toEqual([5, 15])
		expect(coordinates.drawingToPixel([2, 1]).coordinates).toEqual([25, 5])
	})

	test('resolves a custom transformation', () => {
		const coordinates = resolveCustomView({
			type: 'custom',
			width: 300,
			height: 200,
			drawingToPixelTransformation: Transformation.fromUniformScale(20, 2),
		})

		expect(coordinates.drawingToPixel([2, 3]).coordinates).toEqual([40, 60])
	})

	test('rejects invalid view specifications', () => {
		expect(() => resolveScaleView({ type: 'scale', points: [] })).toThrow('at least one vector')
		expect(() => resolveBoundsView({ type: 'bounds', bounds: { min: [0, 0], max: [0, 2] }, width: 100, height: 100 })).toThrow('non-zero size along every axis')
		expect(() => resolveFitView({ type: 'fit', points: [[0, 0], [1, 1]] })).toThrow('finite limit')
		expect(() => resolveFitView({ type: 'fit', points: [[0, 0], [1, 1]], maxWidth: 10, margin: 6 })).toThrow('positive content area')
		expect(() => resolveFitView({ type: 'fit', points: [[0, 0], [1, 1]], maxScale: Infinity })).toThrow('finite')
	})
})
