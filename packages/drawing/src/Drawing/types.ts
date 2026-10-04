import type { ReactNode } from 'react'

import type { Vector, VectorLike } from '@step-wise/geometry'

import type { FigureProps } from '../Figure/index.ts'
import type { DrawingCoordinateSystem, DrawingView } from '../transforms/index.ts'

export type DrawingProps = Omit<FigureProps, 'children' | 'height' | 'width'> & {
	children?: ReactNode
	view: DrawingView
	useCanvas?: boolean
	useSvg?: boolean
}

export interface DrawingHandle {
	readonly element: HTMLDivElement | null
	readonly svg: SVGSVGElement | null
	readonly canvas: HTMLCanvasElement | null
	readonly context: CanvasRenderingContext2D | null
	readonly coordinateSystem: DrawingCoordinateSystem
	readonly width: number
	readonly height: number
	drawingToClient(position: VectorLike): Vector | undefined
	clientToDrawing(position: VectorLike): Vector | undefined
}
