import { type Rectangle, Rectangle as RectangleClass, Transformation } from '@step-wise/geometry'

import { DrawingCoordinateSystem, type CustomView, type Margin } from '../transforms/index.ts'
import { resolveMargin } from '../transforms/viewSupport.ts'

export function getViewAroundTargetBounds(
	coordinateSystem: DrawingCoordinateSystem,
	targetBounds: readonly Rectangle[],
	margin: Margin = 0,
	additionalBounds: readonly Rectangle[] = [],
): CustomView {
	const bounds = getCombinedBounds([...targetBounds, ...additionalBounds])
	const resolvedMargin = resolveMargin(margin)
	const viewBounds = new RectangleClass(
		[bounds.min.x - resolvedMargin[0][0], bounds.min.y - resolvedMargin[1][0]],
		[bounds.max.x + resolvedMargin[0][1], bounds.max.y + resolvedMargin[1][1]],
	)
	const width = viewBounds.width
	const height = viewBounds.height
	const drawingToRenderTransformation = coordinateSystem.drawingToRenderTransformation.then(Transformation.fromTranslation(viewBounds.min.multiply(-1)))
	const renderToPixelTransformation = new DrawingCoordinateSystem({ width, height, yDirection: coordinateSystem.yDirection }).renderToPixelTransformation

	return {
		type: 'custom',
		width,
		height,
		yDirection: coordinateSystem.yDirection,
		drawingToPixelTransformation: drawingToRenderTransformation.then(renderToPixelTransformation),
	}
}

export function getInitialViewBounds(
	coordinateSystem: DrawingCoordinateSystem,
	initialCoordinateSystem: DrawingCoordinateSystem,
): Rectangle {
	const corners = [
		initialCoordinateSystem.renderBounds.topLeft,
		initialCoordinateSystem.renderBounds.topRight,
		initialCoordinateSystem.renderBounds.bottomLeft,
		initialCoordinateSystem.renderBounds.bottomRight,
	].map(position => coordinateSystem.drawingToRender(initialCoordinateSystem.renderToDrawing(position)))
	return getCombinedBounds(corners.map(position => new RectangleClass(position, position)))
}

function getCombinedBounds(bounds: readonly Rectangle[]): Rectangle {
	if (bounds.length === 0) throw new Error('Invalid target bounds view: expected at least one rectangle.')
	return new RectangleClass(
		[Math.min(...bounds.map(bound => bound.min.x)), Math.min(...bounds.map(bound => bound.min.y))],
		[Math.max(...bounds.map(bound => bound.max.x)), Math.max(...bounds.map(bound => bound.max.y))],
	)
}
