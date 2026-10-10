import { useMemo } from 'react'

import type { Rectangle, Transformation } from '@step-wise/geometry'

import { useDrawingTargetRenderBounds, useDrawingTargetRenderBoundsMap } from '../DrawingTargets/renderBoundsHooks.ts'
import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

// Retrieve the bounds of a Drawing target in drawing coordinates.
export function useDrawingTargetBounds(target: string | undefined): Rectangle | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBounds(target)
	return useMemo(() => transformBounds(renderBounds, coordinateSystem.renderToDrawingTransformation), [coordinateSystem, renderBounds])
}

// Retrieve the bounds of multiple Drawing targets in drawing coordinates.
export function useDrawingTargetBoundsMap(targets: readonly string[]): ReadonlyMap<string, Rectangle | undefined> {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBoundsMap(targets)
	return useMemo(() => transformBoundsMap(renderBounds, coordinateSystem.renderToDrawingTransformation), [coordinateSystem, renderBounds])
}

// Retrieve the bounds of a Drawing target in pixel coordinates.
export function useDrawingTargetPixelBounds(target: string | undefined): Rectangle | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBounds(target)
	return useMemo(() => transformBounds(renderBounds, coordinateSystem.renderToPixelTransformation), [coordinateSystem, renderBounds])
}

// Retrieve the bounds of multiple Drawing targets in pixel coordinates.
export function useDrawingTargetPixelBoundsMap(targets: readonly string[]): ReadonlyMap<string, Rectangle | undefined> {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBoundsMap(targets)
	return useMemo(() => transformBoundsMap(renderBounds, coordinateSystem.renderToPixelTransformation), [coordinateSystem, renderBounds])
}

function transformBounds(bounds: Rectangle | undefined, transformation: Transformation): Rectangle | undefined {
	return bounds && transformation.transform(bounds)
}

function transformBoundsMap(boundsMap: ReadonlyMap<string, Rectangle | undefined>, transformation: Transformation): ReadonlyMap<string, Rectangle | undefined> {
	return new Map([...boundsMap].map(([target, bounds]) => [target, transformBounds(bounds, transformation)]))
}
