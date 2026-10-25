import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/index.ts'
import { type Position, useDrawingPixelPosition, useDrawingPixelPositions } from '../positioning/index.ts'

// Resolve a public pixel position and convert it at the internal SVG/render boundary.
export function useRenderPosition(position: Position | undefined): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelPosition = useDrawingPixelPosition(position)
	return pixelPosition === undefined ? undefined : coordinateSystem.pixelToRender(pixelPosition)
}

// Resolve public pixel positions and convert them at the internal SVG/render boundary.
export function useRenderPositions(positions: readonly Position[] | undefined): Vector[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelPositions = useDrawingPixelPositions(positions)
	if (!pixelPositions?.every(position => position !== undefined)) return undefined
	return pixelPositions.map(position => coordinateSystem.pixelToRender(position))
}
