import { useMemo } from 'react'

import type { Rectangle, Transformation } from '@step-wise/geometry'

import type { YDirection } from '../transforms/index.ts'
import { useDrawingTargetRenderBounds, useDrawingTargetRenderBoundsMap } from '../DrawingTargets/renderBoundsHooks.ts'
import { useDrawingCoordinateSystem } from '../Drawing/context.ts'

import { Bounds } from './Bounds.ts'

// Retrieve the bounds of a Drawing target in drawing coordinates.
export function useDrawingTargetBounds(target: string | undefined): Bounds | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBounds(target)
	return useMemo(() => transformBounds(renderBounds, coordinateSystem.renderToDrawingTransformation, coordinateSystem.yDirection), [coordinateSystem, renderBounds])
}

// Retrieve the bounds of multiple Drawing targets in drawing coordinates.
export function useDrawingTargetBoundsMap(targets: readonly string[]): ReadonlyMap<string, Bounds | undefined> {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBoundsMap(targets)
	return useMemo(() => transformBoundsMap(renderBounds, coordinateSystem.renderToDrawingTransformation, coordinateSystem.yDirection), [coordinateSystem, renderBounds])
}

// Retrieve the bounds of a Drawing target in pixel coordinates.
export function useDrawingTargetPixelBounds(target: string | undefined): Bounds | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBounds(target)
	return useMemo(() => transformBounds(renderBounds, coordinateSystem.renderToPixelTransformation, coordinateSystem.yDirection), [coordinateSystem, renderBounds])
}

// Retrieve the bounds of multiple Drawing targets in pixel coordinates.
export function useDrawingTargetPixelBoundsMap(targets: readonly string[]): ReadonlyMap<string, Bounds | undefined> {
	const coordinateSystem = useDrawingCoordinateSystem()
	const renderBounds = useDrawingTargetRenderBoundsMap(targets)
	return useMemo(() => transformBoundsMap(renderBounds, coordinateSystem.renderToPixelTransformation, coordinateSystem.yDirection), [coordinateSystem, renderBounds])
}

function transformBounds(bounds: Rectangle | undefined, transformation: Transformation, yDirection: YDirection): Bounds | undefined {
	return bounds && new Bounds(transformation.transform(bounds), yDirection)
}

function transformBoundsMap(boundsMap: ReadonlyMap<string, Rectangle | undefined>, transformation: Transformation, yDirection: YDirection): ReadonlyMap<string, Bounds | undefined> {
	return new Map([...boundsMap].map(([target, bounds]) => [target, transformBounds(bounds, transformation, yDirection)]))
}
