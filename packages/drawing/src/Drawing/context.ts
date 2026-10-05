import { createContext, useContext } from 'react'

import type { DrawingCoordinateSystem } from '../transforms/index.ts'

export interface DrawingContextValue {
	readonly id: string
	readonly clipPathId: string
	readonly coordinateSystem: DrawingCoordinateSystem
	readonly element: HTMLDivElement | null
	readonly svg: SVGSVGElement | null
	readonly svgDefs: SVGDefsElement | null
	readonly canvas: HTMLCanvasElement | null
	readonly html: HTMLDivElement | null
}

const DrawingContext = createContext<DrawingContextValue | undefined>(undefined)

export const DrawingContextProvider = DrawingContext.Provider

export function useDrawing(): DrawingContextValue {
	const drawing = useContext(DrawingContext)
	if (!drawing) throw new Error('Drawing context is unavailable: this hook must be used inside a Drawing.')
	return drawing
}

export function useDrawingId(): string {
	return useDrawing().id
}

export function useDrawingCoordinateSystem(): DrawingCoordinateSystem {
	return useDrawing().coordinateSystem
}
