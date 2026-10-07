import { createContext, useContext } from 'react'

import type { Rectangle } from '@step-wise/geometry'

import type { PlotAxes, PlotAxis, ResolvedPlotAxis } from './types.ts'

export interface PlotContextValue {
	readonly domain: Rectangle
	readonly axes: PlotAxes<ResolvedPlotAxis>
	readonly clipPathId: string
}

const PlotContext = createContext<PlotContextValue | undefined>(undefined)
export const PlotContextProvider = PlotContext.Provider

export function usePlot(): PlotContextValue {
	const plot = useContext(PlotContext)
	if (!plot) throw new Error('Plot context is unavailable: this hook must be used inside a Plot.')
	return plot
}

export function usePlotDomain(): Rectangle {
	return usePlot().domain
}

export function usePlotAxis(axis: PlotAxis): ResolvedPlotAxis {
	return usePlot().axes[axis]
}

export function usePlotTicks(axis: PlotAxis): readonly number[] {
	return usePlotAxis(axis).ticks
}
