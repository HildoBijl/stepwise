import type { ReactNode } from 'react'

import { Circle, type CircleProps, Line, type LineProps } from '../primitives/svg/index.ts'
import { Label, type LabelProps } from '../primitives/html/index.ts'
import { useDrawingPointerState } from '../Drawing/index.ts'

import { usePlot } from './context.ts'

export interface CrosshairProps {
	// Should we show the crosshair lines, marker, and axis values?
	showXLine?: boolean
	showYLine?: boolean
	showMarker?: boolean
	showAxisValues?: boolean

	// How should the values be formatted and displayed?
	formatXValue?: (value: number) => ReactNode
	formatYValue?: (value: number) => ReactNode
	getPointLabel?: (position: readonly [number, number]) => ReactNode

	// What props should be passed to the underlying elements?
	lineProps?: Omit<LineProps, 'positions'>
	markerProps?: Omit<CircleProps, 'center' | 'radius'> & { radius?: CircleProps['radius'] }
	labelProps?: Omit<LabelProps, 'children' | 'position'>
}

export function Crosshair(props: CrosshairProps) {
	// Load the provided props and the plot context.
	const { formatXValue = defaultFormatValue, formatYValue = defaultFormatValue, getPointLabel, labelProps, lineProps, markerProps, showAxisValues = true, showMarker = true, showXLine = true, showYLine = true } = props
	const { drawingPosition, isInside } = useDrawingPointerState()
	const { axes, domain } = usePlot()

	// Don't draw the Crosshair on an unknown or invalid pointer position.
	if (!isInside || drawingPosition === undefined || !domain.containsPoint(drawingPosition)) return null

	// Determine the positions of the labels.
	const position: readonly [number, number] = [drawingPosition.x, drawingPosition.y]
	const xLabelAngle = drawingPosition.y >= axes.x.position ? -Math.PI / 2 : Math.PI / 2
	const yLabelAngle = drawingPosition.x >= axes.y.position ? Math.PI : 0
	const pointLabelAngle = domain.midpoint.subtract(drawingPosition).angle
	
	// Render the lines/markers.
	const pointLabel = getPointLabel?.(position)
	return <>
		{/* Line/marker for x-axis. */}
		{showXLine && <Line strokeDasharray="4 4" strokeWidth={1} {...lineProps} positions={[[drawingPosition.x, axes.x.position], drawingPosition]} />}
		{showAxisValues && showXLine && <Label distance={{ pixelDistance: 8 }} {...labelProps} angle={xLabelAngle} position={[drawingPosition.x, axes.x.position]}>{formatXValue(drawingPosition.x)}</Label>}

		{/* Line/marker for y-axis. */}
		{showYLine && <Line strokeDasharray="4 4" strokeWidth={1} {...lineProps} positions={[[axes.y.position, drawingPosition.y], drawingPosition]} />}
		{showAxisValues && showYLine && <Label distance={{ pixelDistance: 8 }} {...labelProps} angle={yLabelAngle} position={[axes.y.position, drawingPosition.y]}>{formatYValue(drawingPosition.y)}</Label>}

		{/* Point marker. */}
		{showMarker && <Circle fill="currentColor" radius={{ pixelDistance: 4 }} {...markerProps} center={drawingPosition} />}
		{pointLabel !== undefined && <Label distance={{ pixelDistance: 10 }} {...labelProps} angle={pointLabelAngle} position={drawingPosition}>{pointLabel}</Label>}
	</>
}

function defaultFormatValue(value: number): string {
	return String(Number(value.toPrecision(3)))
}
