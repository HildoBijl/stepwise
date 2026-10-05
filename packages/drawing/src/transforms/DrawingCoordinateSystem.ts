import { ensureNumber } from '@step-wise/js-utils'
import { type VectorLike, Rectangle, Transformation, Vector, ensureTransformation } from '@step-wise/geometry'

import { type ClientRectangle, type DrawingCoordinateSystemOptions, type YDirection, ensureYDirection } from './types.ts'

export class DrawingCoordinateSystem {
	readonly width: number
	readonly height: number
	readonly yDirection: YDirection
	readonly pixelBounds: Rectangle
	readonly renderBounds: Rectangle
	readonly drawingToPixelTransformation: Transformation
	readonly pixelToDrawingTransformation: Transformation
	readonly pixelToRenderTransformation: Transformation
	readonly renderToPixelTransformation: Transformation
	readonly drawingToRenderTransformation: Transformation
	readonly renderToDrawingTransformation: Transformation

	constructor(options: DrawingCoordinateSystemOptions) {
		// Validate and initialize properties.
		this.width = ensureNumber(options.width, { nonNegative: true, nonZero: true })
		this.height = ensureNumber(options.height, { nonNegative: true, nonZero: true })
		this.yDirection = ensureYDirection(options.yDirection ?? 'down')
		this.pixelBounds = new Rectangle([0, 0], [this.width, this.height])
		this.renderBounds = this.pixelBounds

		// Initialize transformations.
		this.drawingToPixelTransformation = ensureTransformation(options.drawingToPixelTransformation ?? Transformation.getIdentity(2), { dimension: 2, invertible: true })
		this.pixelToDrawingTransformation = this.drawingToPixelTransformation.inverse
		this.pixelToRenderTransformation = getPixelToRenderTransformation(this.height, this.yDirection)
		this.renderToPixelTransformation = this.pixelToRenderTransformation.inverse
		this.drawingToRenderTransformation = this.drawingToPixelTransformation.then(this.pixelToRenderTransformation)
		this.renderToDrawingTransformation = this.drawingToRenderTransformation.inverse
	}

	/*
	 * Coordinate transformation methods.
	 */

	drawingToPixel(position: VectorLike): Vector {
		return this.drawingToPixelTransformation.transform(position)
	}

	pixelToDrawing(position: VectorLike): Vector {
		return this.pixelToDrawingTransformation.transform(position)
	}

	pixelToRender(position: VectorLike): Vector {
		return this.pixelToRenderTransformation.transform(position)
	}

	renderToPixel(position: VectorLike): Vector {
		return this.renderToPixelTransformation.transform(position)
	}

	drawingToRender(position: VectorLike): Vector {
		return this.drawingToRenderTransformation.transform(position)
	}

	renderToDrawing(position: VectorLike): Vector {
		return this.renderToDrawingTransformation.transform(position)
	}
	
	/*
	 * Vector transformation methods: without translation.
	 */

	drawingVectorToPixel(vector: VectorLike): Vector {
		return this.drawingToPixelTransformation.transform(vector, { applyTranslation: false })
	}

	pixelVectorToDrawing(vector: VectorLike): Vector {
		return this.pixelToDrawingTransformation.transform(vector, { applyTranslation: false })
	}

	pixelVectorToRender(vector: VectorLike): Vector {
		return this.pixelToRenderTransformation.transform(vector, { applyTranslation: false })
	}

	renderVectorToPixel(vector: VectorLike): Vector {
		return this.renderToPixelTransformation.transform(vector, { applyTranslation: false })
	}

	/*
	 * Client rectangle transformation methods.
	 */

	getRenderToClientTransformation(clientRectangle: ClientRectangle): Transformation {
		const rectangle = ensureClientRectangle(clientRectangle)
		return Transformation.fromScale([rectangle.width / this.width, rectangle.height / this.height]).then(Transformation.fromTranslation([rectangle.left, rectangle.top]))
	}

	getClientToRenderTransformation(clientRectangle: ClientRectangle): Transformation {
		return this.getRenderToClientTransformation(clientRectangle).inverse
	}

	renderToClient(position: VectorLike, clientRectangle: ClientRectangle): Vector {
		return this.getRenderToClientTransformation(clientRectangle).transform(position)
	}

	clientToRender(position: VectorLike, clientRectangle: ClientRectangle): Vector {
		return this.getClientToRenderTransformation(clientRectangle).transform(position)
	}

	pixelToClient(position: VectorLike, clientRectangle: ClientRectangle): Vector {
		return this.renderToClient(this.pixelToRender(position), clientRectangle)
	}

	clientToPixel(position: VectorLike, clientRectangle: ClientRectangle): Vector {
		return this.renderToPixel(this.clientToRender(position, clientRectangle))
	}

	drawingToClient(position: VectorLike, clientRectangle: ClientRectangle): Vector {
		return this.renderToClient(this.drawingToRender(position), clientRectangle)
	}

	clientToDrawing(position: VectorLike, clientRectangle: ClientRectangle): Vector {
		return this.renderToDrawing(this.clientToRender(position, clientRectangle))
	}

	/*
	 * Drawing-bound checks and calculations.
	 */

	containsDrawingPosition(position: VectorLike): boolean {
		return this.pixelBounds.containsPoint(this.drawingToPixel(position))
	}

	clampDrawingPosition(position: VectorLike): Vector {
		return this.pixelToDrawing(this.pixelBounds.clampPoint(this.drawingToPixel(position)))
	}
}

function getPixelToRenderTransformation(height: number, yDirection: YDirection): Transformation {
	if (yDirection === 'down') return Transformation.getIdentity(2)
	return new Transformation([[1, 0], [0, -1]], [0, height])
}

function ensureClientRectangle(value: ClientRectangle): ClientRectangle {
	return {
		left: ensureNumber(value.left),
		top: ensureNumber(value.top),
		width: ensureNumber(value.width, { nonNegative: true, nonZero: true }),
		height: ensureNumber(value.height, { nonNegative: true, nonZero: true }),
	}
}
