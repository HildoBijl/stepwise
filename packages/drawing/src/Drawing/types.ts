import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'

import type { Vector, VectorLike } from '@step-wise/geometry'

import type { FigureProps } from '../Figure/index.ts'
import type { DrawingCoordinateSystem, DrawingView } from '../transforms/index.ts'

export interface DrawingOptions {
	children?: ReactNode
	clip?: boolean
	useCanvas?: boolean
	useSvg?: boolean
}

export type DrawingProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & DrawingOptions & {
	ref?: Ref<DrawingHandle>
	view: DrawingView
}

export type DrawingFigureProps = Omit<FigureProps, 'children' | 'height' | 'ref' | 'width'> & DrawingOptions & {
	ref?: Ref<DrawingHandle>
	view: DrawingView
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
