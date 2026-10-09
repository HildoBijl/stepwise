import { type Rectangle, Rectangle as RectangleClass, Transformation } from '@step-wise/geometry'

import type { CustomView, DrawingCoordinateSystem, Margin } from '../transforms/index.ts'
import { resolveMargin } from '../transforms/viewSupport.ts'

import type { TargetBounds } from './targetBounds.ts'

// Given a set of bounds in pixel coordinates and an existing coordinate system, come up with a new view definition that encompasses the bounds and adds an optional margin around them.
export function getViewAroundTargetBounds(
	targetBounds: Readonly<Record<string, TargetBounds>>,
	coordinateSystem: DrawingCoordinateSystem,
	margin: Margin = 0,
): CustomView {
	// Based on the given target bounds, determine the view bounds in pixel coordinates.
	const bounds = getCombinedBounds(Object.values(targetBounds).map(bounds => bounds.rectangle))
	const resolvedMargin = resolveMargin(margin)
	const viewBounds = new RectangleClass(
		[bounds.min.x - resolvedMargin[0][0], bounds.min.y - resolvedMargin[1][0]],
		[bounds.max.x + resolvedMargin[0][1], bounds.max.y + resolvedMargin[1][1]],
	)
	const width = viewBounds.width
	const height = viewBounds.height

	// Shift the minimum pixel-coordinate corner of the view bounds to the [0, 0] point.
	const drawingToPixelTransformation = coordinateSystem.drawingToPixelTransformation.then(Transformation.fromTranslation(viewBounds.min.multiply(-1)))

	// Return a custom view.
	return {
		type: 'custom',
		width,
		height,
		yDirection: coordinateSystem.yDirection,
		drawingToPixelTransformation,
	}
}

// From a list of rectangles, determine the smallest rectangle that contains all these rectangles.
function getCombinedBounds(bounds: readonly Rectangle[]): Rectangle {
	if (bounds.length === 0) throw new Error('Invalid target bounds view: expected at least one rectangle.')
	return new RectangleClass(
		[Math.min(...bounds.map(bound => bound.min.x)), Math.min(...bounds.map(bound => bound.min.y))],
		[Math.max(...bounds.map(bound => bound.max.x)), Math.max(...bounds.map(bound => bound.max.y))],
	)
}
