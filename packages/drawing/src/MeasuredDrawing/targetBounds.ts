import { fromKeys, hasDuplicates, mapValues } from '@step-wise/js-utils'
import type { Rectangle } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'

// A supporting type for the MeasuredDrawing calculation function. It gives info in an easier form than a plain Rectangle object.
export interface TargetBounds {
	readonly rectangle: Rectangle
	readonly left: number
	readonly right: number
	readonly top: number
	readonly bottom: number
	readonly width: number
	readonly height: number
}

// A record of TargetBounds, indexed by target name.
export type TargetBoundsRecord<Targets extends readonly string[]> = {
	readonly [Target in Targets[number]]: TargetBounds
}

// A record of Rectangle objects, indexed by target name.
export type TargetRectanglesRecord<Targets extends readonly string[]> = {
	readonly [Target in Targets[number]]: Rectangle
}

// Collect the rectangles for a list of unique target names. Return undefined while any target is unresolved.
export function resolveTargetRectanglesRecord<Targets extends readonly string[]>(targets: Targets, bounds: ReadonlyMap<string, Rectangle | undefined>): TargetRectanglesRecord<Targets> | undefined {
	// Run a duplicates check on the targets.
	if (hasDuplicates(targets)) {
		const duplicateTarget = targets.find((target, index) => targets.indexOf(target) !== index)
		throw new Error(`Invalid measured drawing targets: target "${duplicateTarget}" occurs more than once.`)
	}

	// Set up the rectangles object. Run a check that it includes all targets.
	const rectangles = fromKeys(targets, target => bounds.get(target))
	return Object.keys(rectangles).length === targets.length ? rectangles as TargetRectanglesRecord<Targets> : undefined
}

// Turn a Rectangle in render coordinates into the supporting TargetBounds type in pixel coordinates.
export function toTargetBounds(renderRectangle: Rectangle, coordinateSystem: DrawingCoordinateSystem): TargetBounds {
	const rectangle = coordinateSystem.renderToPixelTransformation.transform(renderRectangle)
	return {
		rectangle,
		left: rectangle.min.x,
		right: rectangle.max.x,
		top: coordinateSystem.yDirection === 'up' ? rectangle.max.y : rectangle.min.y,
		bottom: coordinateSystem.yDirection === 'up' ? rectangle.min.y : rectangle.max.y,
		width: rectangle.width,
		height: rectangle.height,
	}
}

// Turn a record of Rectangles in render coordinates into a record of TargetBounds in pixel coordinates.
export function toTargetBoundsRecord<Targets extends readonly string[]>(rectangles: TargetRectanglesRecord<Targets>, coordinateSystem: DrawingCoordinateSystem): TargetBoundsRecord<Targets> {
	return mapValues<Rectangle, TargetBounds>(rectangles, rectangle => toTargetBounds(rectangle, coordinateSystem)) as TargetBoundsRecord<Targets>
}
