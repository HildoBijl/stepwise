import { describe, expect, test } from 'vitest'

import { Transformation } from '@step-wise/geometry'

import { DrawingCoordinateSystem } from './DrawingCoordinateSystem.ts'

describe('DrawingCoordinateSystem', () => {
	test('uses matching pixel and render coordinates for a downward y-axis', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 200, height: 100 })

		expect(coordinates.pixelToRender([20, 30]).coordinates).toEqual([20, 30])
		expect(coordinates.renderToPixel([20, 30]).coordinates).toEqual([20, 30])
		expect(coordinates.pixelVectorToRender([5, 7]).coordinates).toEqual([5, 7])
	})

	test('converts upward pixel coordinates at the rendering boundary', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 200, height: 100, yDirection: 'up' })

		expect(coordinates.pixelToRender([20, 30]).coordinates).toEqual([20, 70])
		expect(coordinates.renderToPixel([20, 70]).coordinates).toEqual([20, 30])
		expect(coordinates.pixelVectorToRender([5, 7]).coordinates).toEqual([5, -7])
		expect(coordinates.renderVectorToPixel([5, -7]).coordinates).toEqual([5, 7])
	})

	test('combines drawing, pixel, and render transformations', () => {
		const drawingToPixelTransformation = Transformation.fromScale([10, 20])
			.then(Transformation.fromTranslation([30, 40]))
		const coordinates = new DrawingCoordinateSystem({
			width: 200,
			height: 100,
			yDirection: 'up',
			drawingToPixelTransformation,
		})

		expect(coordinates.drawingToPixel([2, 1]).coordinates).toEqual([50, 60])
		expect(coordinates.pixelToDrawing([50, 60]).coordinates).toEqual([2, 1])
		expect(coordinates.drawingToRender([2, 1]).coordinates).toEqual([50, 40])
		expect(coordinates.renderToDrawing([50, 40]).coordinates).toEqual([2, 1])
		expect(coordinates.drawingVectorToPixel([2, 1]).coordinates).toEqual([20, 20])
	})

	test('converts between render and client coordinates using the displayed rectangle', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 200, height: 100 })
		const clientRectangle = { left: 100, top: 50, width: 400, height: 200 }

		expect(coordinates.renderToClient([20, 30], clientRectangle).coordinates).toEqual([140, 110])
		expect(coordinates.clientToRender([140, 110], clientRectangle).coordinates).toEqual([20, 30])
	})

	test('converts directly between upward pixel and client coordinates', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 200, height: 100, yDirection: 'up' })
		const clientRectangle = { left: 100, top: 50, width: 400, height: 200 }

		expect(coordinates.pixelToClient([20, 30], clientRectangle).coordinates).toEqual([140, 190])
		expect(coordinates.clientToPixel([140, 190], clientRectangle).coordinates).toEqual([20, 30])
	})

	test('rejects invalid coordinate-system settings', () => {
		expect(() => new DrawingCoordinateSystem({ width: 0, height: 100 })).toThrow('zero')
		expect(() => new DrawingCoordinateSystem({ width: 200, height: 100, yDirection: 'left' as 'up' })).toThrow('Invalid y-direction')
		expect(() => new DrawingCoordinateSystem({
			width: 200,
			height: 100,
			drawingToPixelTransformation: [[1, 0], [0, 0]],
		})).toThrow('required an invertible transformation')
	})

	test('rejects a client rectangle without a displayed area', () => {
		const coordinates = new DrawingCoordinateSystem({ width: 200, height: 100 })
		expect(() => coordinates.clientToPixel([0, 0], { left: 0, top: 0, width: 0, height: 100 })).toThrow('zero')
	})
})
