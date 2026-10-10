import { useDrawingTargetRenderBoundsMap } from '../DrawingTargets/renderBoundsHooks.ts'
import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { type Distance, getDistanceTargets, resolveDistance } from './distances.ts'

// Resolve a distance and return it in drawing coordinates. Return undefined if required data is missing.
export function useDrawingDistance(distance: Distance | undefined): number | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelDistance = useDrawingPixelDistance(distance)
	return pixelDistance === undefined ? undefined : pixelDistance / getDrawingToPixelScale(coordinateSystem.drawingToPixelTransformation.determinant)
}

// Resolve multiple distances to drawing coordinates, preserving unresolved entries as undefined.
export function useDrawingDistances(distances: readonly Distance[] | undefined): (number | undefined)[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelDistances = useDrawingPixelDistances(distances)
	if (pixelDistances === undefined) return undefined
	const scale = getDrawingToPixelScale(coordinateSystem.drawingToPixelTransformation.determinant)
	return pixelDistances.map(distance => distance === undefined ? undefined : distance / scale)
}

// Resolve a distance and return it in pixels. Return undefined if required data is missing.
export function useDrawingPixelDistance(distance: Distance | undefined): number | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetRenderBoundsMap(distance === undefined ? [] : getDistanceTargets(distance))
	if (distance === undefined) return undefined
	return resolveDistance(distance, coordinateSystem, target => targetBounds.get(target))
}

// Resolve multiple distances to pixels, preserving unresolved entries as undefined.
export function useDrawingPixelDistances(distances: readonly Distance[] | undefined): (number | undefined)[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const targetBounds = useDrawingTargetRenderBoundsMap(distances === undefined ? [] : [...new Set(distances.flatMap(getDistanceTargets))])
	if (distances === undefined) return undefined
	return distances.map(distance => resolveDistance(distance, coordinateSystem, target => targetBounds.get(target)))
}

function getDrawingToPixelScale(determinant: number): number {
	return Math.sqrt(Math.abs(determinant))
}
