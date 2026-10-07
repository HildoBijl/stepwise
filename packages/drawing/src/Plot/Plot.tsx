import { forwardRef, useId, useMemo } from 'react'

import { Rectangle } from '@step-wise/geometry'

import { Drawing, SvgDefsPortal, useDrawingCoordinateSystem } from '../Drawing/index.ts'

import type { PlotHandle, PlotProps } from './types.ts'
import { PlotContextProvider, usePlot } from './context.ts'
import { resolvePlot, resolvePlotView } from './resolution.ts'

export const Plot = forwardRef<PlotHandle, PlotProps>(function Plot(props, ref) {
	const { axes, bounds, children, points, view, ...drawingProps } = props

	// Resolve the plot and drawing view.
	const resolved = useMemo(() => resolvePlot(bounds, points, axes), [bounds, points, axes])
	const drawingView = useMemo(() => resolvePlotView(view, resolved.domain), [view, resolved.domain])

	// Set up the plot context for the children.
	const clipPathId = `${useId().replaceAll(':', '')}-plot-area`
	const context = useMemo(() => ({ ...resolved, clipPathId }), [resolved, clipPathId])

	// Render the plot.
	return <PlotContextProvider value={context}>
		<Drawing {...drawingProps} ref={ref} view={drawingView}>
			<PlotClipDefinition />
			{children}
		</Drawing>
	</PlotContextProvider>
})

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
