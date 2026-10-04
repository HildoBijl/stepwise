import { ensureBoolean, ensureNumber } from '@step-wise/js-utils'
import { Transformation, ensureRectangle } from '@step-wise/geometry'

import { DrawingCoordinateSystem } from './DrawingCoordinateSystem.ts'
import { type BoundsView, type CustomView, type DrawingView, type FitView, type IdentityView, type ScaleView } from './viewTypes.ts'
import { getPointBounds, resolveMargin, resolvePoints, resolvePretransform, resolveScale } from './viewSupport.ts'

export function resolveDrawingView(view: DrawingView): DrawingCoordinateSystem {
	switch (view.type) {
		case 'identity': return resolveIdentityView(view)
		case 'bounds': return resolveBoundsView(view)
		case 'scale': return resolveScaleView(view)
		case 'fit': return resolveFitView(view)
		case 'custom': return resolveCustomView(view)
	}
}

// Apply the identity transformation for the given width/height.
export function resolveIdentityView(view: IdentityView): DrawingCoordinateSystem {
	return new DrawingCoordinateSystem(view)
}

// For given drawing coordinate bounds, and a given client width/height (taking into account margins) determine the transformation.
export function resolveBoundsView(view: BoundsView): DrawingCoordinateSystem {
	// Determine the available width/height for the inner drawing.
	const width = ensureNumber(view.width, { nonNegative: true, nonZero: true })
	const height = ensureNumber(view.height, { nonNegative: true, nonZero: true })
	const margin = resolveMargin(view.margin)
	const availableWidth = ensureAvailableSize(width - margin[0][0] - margin[0][1], 'width')
	const availableHeight = ensureAvailableSize(height - margin[1][0] - margin[1][1], 'height')

	// Based on the available width/height, determine the scale and the according transformation.
	const bounds = ensureRectangle(view.bounds, { dimension: 2, nonZero: true })
	const scale = [availableWidth / bounds.width, availableHeight / bounds.height]
	const transformation = Transformation.fromTranslation(bounds.min.multiply(-1))
		.then(Transformation.fromScale(scale))
		.then(Transformation.fromTranslation([margin[0][0], margin[1][0]]))

	// Set up the coordinate system.
	return new DrawingCoordinateSystem({
		width,
		height,
		yDirection: view.yDirection,
		drawingToPixelTransformation: transformation,
	})
}

// For a given set of points, apply a scaling, add a margin, and determine the subsequent transformation plus width/height.
export function resolveScaleView(view: ScaleView): DrawingCoordinateSystem {
	// Set up the transformed points (also incorporating scale) and determine their bounds.
	const points = resolvePoints(view.points)
	const scale = resolveScale(view.scale)
	const pretransform = resolvePretransform(view.pretransform)
	const scaleTransformation = Transformation.fromScale([...scale])
	const transformedPoints = points.map(point => pretransform.then(scaleTransformation).transform(point))
	const bounds = getPointBounds(transformedPoints)

	// For the bounds, set up the transformation from the coordinates of the points towards pixel coordinates.
	const margin = resolveMargin(view.margin)
	const shift = bounds.min.multiply(-1).add([margin[0][0], margin[1][0]])
	const width = bounds.width + margin[0][0] + margin[0][1]
	const height = bounds.height + margin[1][0] + margin[1][1]

	// Set up the coordinate system.
	return new DrawingCoordinateSystem({
		width,
		height,
		yDirection: view.yDirection,
		drawingToPixelTransformation: pretransform
			.then(scaleTransformation)
			.then(Transformation.fromTranslation(shift)),
	})
}

// For a given set of points, determine the transformation that fits them within the given maximum width/height/scaling.
export function resolveFitView(view: FitView): DrawingCoordinateSystem {
	// Pretransform points and determine their bounds.
	const points = resolvePoints(view.points)
	const pretransform = resolvePretransform(view.pretransform)
	const transformedBounds = getPointBounds(points.map(point => pretransform.transform(point)))

	// Determine the available width/height for the inner drawing.
	const margin = resolveMargin(view.margin)
	const maxWidth = ensureMaximum(view.maxWidth, 'maxWidth')
	const maxHeight = ensureMaximum(view.maxHeight, 'maxHeight')
	const maxScale = view.maxScale === undefined ? [Infinity, Infinity] : resolveScale(view.maxScale)
	const uniform = ensureBoolean(view.uniform ?? true)
	if (view.maxWidth === undefined && view.maxHeight === undefined && view.maxScale === undefined) throw new Error('Invalid fit view: expected maxWidth, maxHeight, or maxScale to impose a finite limit.')

	// Determine the largest scale that we can use that still fits the points within the given maximum values.
	let scale = [
		getFittingScale(transformedBounds.width, maxWidth - margin[0][0] - margin[0][1], maxScale[0], 'width'),
		getFittingScale(transformedBounds.height, maxHeight - margin[1][0] - margin[1][1], maxScale[1], 'height'),
	]
	if (uniform) scale = [Math.min(...scale), Math.min(...scale)]
	scale = scale.map(value => value === Infinity ? 1 : value)

	// Apply the given scaling.
	return resolveScaleView({
		type: 'scale',
		points,
		scale,
		margin,
		pretransform,
		yDirection: view.yDirection,
	})
}

// For a given transformation, use it to set up the coordinate system.
export function resolveCustomView(view: CustomView): DrawingCoordinateSystem {
	return new DrawingCoordinateSystem(view)
}

// Ensure that the given value (size) is still positive, and can hence be used as an available size parameter.
function ensureAvailableSize(value: number, dimension: string): number {
	if (value > 0) return value
	throw new Error(`Invalid Drawing view ${dimension}: margins must leave a positive content area.`)
}

// Ensure that the given maximum value is indeed a suitable maximum: either undefined (infinity) or a positive number.
function ensureMaximum(value: number | undefined, name: string): number {
	return value === undefined ? Infinity : ensureNumber(value, { nonNegative: true, nonZero: true })
}

// Determine the largest scale that we can use that still fits the points within the given maximum values.
function getFittingScale(size: number, availableSize: number, maxScale: number, dimension: string): number {
	if (availableSize !== Infinity) ensureAvailableSize(availableSize, dimension)
	return Math.min(size === 0 ? Infinity : availableSize / size, maxScale)
}
