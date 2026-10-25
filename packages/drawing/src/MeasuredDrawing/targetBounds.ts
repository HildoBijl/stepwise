import { fromKeys, hasDuplicates, mapValues } from '@step-wise/js-utils'
import type { Rectangle } from '@step-wise/geometry'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'
import { Bounds } from '../positioning/Bounds.ts'

// A record of Bounds objects, indexed by target name.
export type TargetBoundsRecord<Targets extends readonly string[]> = {
	readonly [Target in Targets[number]]: Bounds
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

// Turn a record of Rectangles in render coordinates into a record of Bounds objects in pixel coordinates.
export function toTargetBoundsRecord<Targets extends readonly string[]>(rectangles: TargetRectanglesRecord<Targets>, coordinateSystem: DrawingCoordinateSystem): TargetBoundsRecord<Targets> {
	return mapValues<Rectangle, Bounds>(rectangles, rectangle => new Bounds(coordinateSystem.renderToPixelTransformation.transform(rectangle), coordinateSystem.yDirection)) as TargetBoundsRecord<Targets>
}
