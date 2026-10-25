import { useId, useMemo } from 'react'

import { Rectangle } from '@step-wise/geometry'

import { Drawing, DrawingFigure, SvgDefsPortal, useDrawingCoordinateSystem } from '../Drawing/index.ts'

import type { PlotFigureProps, PlotProps } from './types.ts'
import { PlotContextProvider, usePlot } from './context.ts'
import { resolvePlot, resolvePlotView } from './resolution.ts'

export function Plot(props: PlotProps) {
	const { axes, bounds, children, points, ref, view, ...drawingProps } = props
	const { context, drawingView } = useResolvedPlot(bounds, points, axes, view)
	return <PlotContextProvider value={context}>
		<Drawing {...drawingProps} ref={ref} view={drawingView}>
			<PlotClipDefinition />
			{children}
		</Drawing>
	</PlotContextProvider>
}

export function PlotFigure(props: PlotFigureProps) {
	const { axes, bounds, children, points, ref, view, ...drawingProps } = props
	const { context, drawingView } = useResolvedPlot(bounds, points, axes, view)
	return <PlotContextProvider value={context}>
		<DrawingFigure {...drawingProps} ref={ref} view={drawingView}>
			<PlotClipDefinition />
			{children}
		</DrawingFigure>
	</PlotContextProvider>
}

function useResolvedPlot(bounds: PlotProps['bounds'], points: PlotProps['points'], axes: PlotProps['axes'], view: PlotProps['view']) {

	// Resolve the plot and drawing view.
	const resolved = useMemo(() => resolvePlot(bounds, points, axes), [bounds, points, axes])
	const drawingView = useMemo(() => resolvePlotView(view, resolved.domain), [view, resolved.domain])

	// Set up the plot context for the children.
	const clipPathId = `${useId().replaceAll(':', '')}-plot-area`
	const context = useMemo(() => ({ ...resolved, clipPathId }), [resolved, clipPathId])

	return { context, drawingView }
}

// Render the clip path definition for the plot area.
function PlotClipDefinition() {
	const { domain, clipPathId } = usePlot()
	const coordinates = useDrawingCoordinateSystem()
	const bounds = new Rectangle(coordinates.drawingToRender(domain.min), coordinates.drawingToRender(domain.max))
	return <SvgDefsPortal>
		<clipPath id={clipPathId}>
			<rect height={bounds.height} width={bounds.width} x={bounds.min.x} y={bounds.min.y} />
		</clipPath>
	</SvgDefsPortal>
}
