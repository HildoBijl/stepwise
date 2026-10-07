import type { ReactNode } from 'react'

import type { Rectangle, RectangleLike } from '@step-wise/geometry'

import type { DrawingHandle, DrawingProps } from '../Drawing/index.ts'
import type { Margin, PointCollection, Scale } from '../transforms/index.ts'

/*
 * Generic types.
 */

export type PlotAxis = 'x' | 'y'

export type PlotAxes<T> = Record<PlotAxis, T>

export type AxisPosition = number | 'zero' | 'min' | 'max'

/*
 * Axis definitions.
 */

type TickOptions = { extendDomain?: boolean }

export type PlotTicks = TickOptions & (
	| { values: readonly number[]; step?: never; desiredCount?: never }
	| { values?: never; step: number; desiredCount?: never }
	| { values?: never; step?: never; desiredCount?: number }
)

export interface PlotAxisSettings {
	type?: 'linear'
	domain?: readonly [number, number]
	includeZero?: boolean
	ticks?: PlotTicks
	position?: AxisPosition
}

/*
 * View and range definitions.
 */

export type PlotView =
	| { type: 'bounds'; width: number; height: number; margin?: Margin }
	| { type: 'scale'; scale?: Scale; margin?: Margin }
	| { type: 'fit'; maxWidth?: number; maxHeight?: number; maxScale?: Scale; uniform?: boolean; margin?: Margin }

type PlotRange =
	| { bounds: RectangleLike; points?: never }
	| { bounds?: never; points: PointCollection }

/*
 * General plot props and handle.
 */

export type PlotProps = Omit<DrawingProps, 'children' | 'view'> & PlotRange & {
	view: PlotView
	axes?: Partial<PlotAxes<PlotAxisSettings>>
	children?: ReactNode
}

export type PlotHandle = DrawingHandle

/*
 * Plot resolution data.
 */

export interface ResolvedPlotAxis {
	readonly domain: readonly [number, number]
	readonly position: number
	readonly ticks: readonly number[]
}

export interface ResolvedPlot {
	axes: PlotAxes<ResolvedPlotAxis>
	domain: Rectangle
}
