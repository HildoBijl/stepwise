import type { Vector } from '@step-wise/geometry'
import { type PointerState, usePointerState } from '@step-wise/react-utils'

import { useDrawing } from './context.ts'

export interface DrawingPointerState {
	readonly clientPosition: Vector | undefined
	readonly renderPosition: Vector | undefined
	readonly pixelPosition: Vector | undefined
	readonly drawingPosition: Vector | undefined
	readonly isInside: boolean
	readonly modifierKeys: PointerState['modifierKeys']
}

// Track the pointer and express its position in every coordinate system used by the Drawing.
export function useDrawingPointerState(): DrawingPointerState {
	const { position: clientPosition, modifierKeys } = usePointerState()
	const { coordinateSystem, element } = useDrawing()

	// On insufficient data, return a state with undefined positions.
	if (clientPosition === undefined || element === null) return {
		clientPosition,
		renderPosition: undefined,
		pixelPosition: undefined,
		drawingPosition: undefined,
		isInside: false,
		modifierKeys,
	}

	// Convert the client position to render coordinates, then to pixel and drawing coordinates.
	const clientBounds = element.getBoundingClientRect()
	const renderPosition = coordinateSystem.clientToRender(clientPosition, clientBounds)
	return {
		clientPosition,
		renderPosition,
		pixelPosition: coordinateSystem.renderToPixel(renderPosition),
		drawingPosition: coordinateSystem.renderToDrawing(renderPosition),
		isInside: coordinateSystem.renderBounds.containsPoint(renderPosition),
		modifierKeys,
	}
}

export function useDrawingPointerPosition(): Vector | undefined {
	return useDrawingPointerState().drawingPosition
}

export function usePixelPointerPosition(): Vector | undefined {
	return useDrawingPointerState().pixelPosition
}

export function useRenderPointerPosition(): Vector | undefined {
	return useDrawingPointerState().renderPosition
}

export function useClientPointerPosition(): Vector | undefined {
	return useDrawingPointerState().clientPosition
}
