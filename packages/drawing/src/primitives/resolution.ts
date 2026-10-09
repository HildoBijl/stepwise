import type { Vector } from '@step-wise/geometry'

import { useDrawingCoordinateSystem } from '../Drawing/index.ts'
import { type Position, useResolvedPosition, useResolvedPositions } from '../positioning/index.ts'

// Resolve a public pixel position and convert it at the internal SVG/render boundary.
export function useRenderPosition(position: Position | undefined): Vector | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelPosition = useResolvedPosition(position)
	return pixelPosition === undefined ? undefined : coordinateSystem.pixelToRender(pixelPosition)
}

// Resolve public pixel positions and convert them at the internal SVG/render boundary.
export function useRenderPositions(positions: readonly Position[] | undefined): Vector[] | undefined {
	const coordinateSystem = useDrawingCoordinateSystem()
	const pixelPositions = useResolvedPositions(positions)
	return pixelPositions?.map(position => coordinateSystem.pixelToRender(position))
}
