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
	pointLabelAngle?: number
	pointLabelDistance?: LabelProps['distance']

	// What props should be passed to the underlying elements?
	lineProps?: Omit<LineProps, 'positions'>
	markerProps?: Omit<CircleProps, 'center' | 'radius'> & { radius?: CircleProps['radius'] }
	labelProps?: Omit<LabelProps, 'children' | 'position'>
}

export function Crosshair(props: CrosshairProps) {
	// Load the provided props and the plot context.
	const { formatXValue = defaultFormatValue, formatYValue = defaultFormatValue, getPointLabel, labelProps, lineProps, markerProps, pointLabelAngle, pointLabelDistance = { pixelDistance: 2 }, showAxisValues = true, showMarker = true, showXLine = true, showYLine = true } = props
	const { drawingPosition, isInside } = useDrawingPointerState()
	const { axes, domain } = usePlot()

	// Don't draw the Crosshair on an unknown or invalid pointer position.
	if (!isInside || drawingPosition === undefined || !domain.containsPoint(drawingPosition)) return null

	// Determine the positions of the labels.
	const position: readonly [number, number] = [drawingPosition.x, drawingPosition.y]
	const xLabelAngle = drawingPosition.y >= axes.x.position ? -Math.PI / 2 : Math.PI / 2
	const yLabelAngle = drawingPosition.x >= axes.y.position ? Math.PI : 0
	const resolvedPointLabelAngle = pointLabelAngle ?? getOutwardLabelAngle(drawingPosition.x - axes.y.position, drawingPosition.y - axes.x.position)
	
	// Render the lines/markers.
	const pointLabel = getPointLabel?.(position)
	return <>
		{/* Line/marker for x-axis. */}
		{showXLine && <Line strokeDasharray="4 2" strokeWidth={1} {...lineProps} positions={[[drawingPosition.x, axes.x.position], drawingPosition]} />}
		{showAxisValues && showXLine && <Label distance={{ pixelDistance: 2 }} {...labelProps} angle={xLabelAngle} position={[drawingPosition.x, axes.x.position]}>{formatXValue(drawingPosition.x)}</Label>}

		{/* Line/marker for y-axis. */}
		{showYLine && <Line strokeDasharray="4 2" strokeWidth={1} {...lineProps} positions={[[axes.y.position, drawingPosition.y], drawingPosition]} />}
		{showAxisValues && showYLine && <Label distance={{ pixelDistance: 2 }} {...labelProps} angle={yLabelAngle} position={[axes.y.position, drawingPosition.y]}>{formatYValue(drawingPosition.y)}</Label>}

		{/* Point marker. */}
		{showMarker && <Circle fill="currentColor" radius={{ pixelDistance: 2.5 }} {...markerProps} center={drawingPosition} />}
		{pointLabel !== undefined && <Label {...labelProps} angle={resolvedPointLabelAngle} distance={pointLabelDistance} position={drawingPosition}>{pointLabel}</Label>}
	</>
}

// Point a label diagonally away from the intersection of the plot axes, or straight out when the point lies on an axis.
function getOutwardLabelAngle(relativeX: number, relativeY: number): number {
	if (relativeX === 0 && relativeY === 0) return Math.PI / 4
	return Math.atan2(Math.sign(relativeY), Math.sign(relativeX))
}

function defaultFormatValue(value: number): string {
	return String(Number(value.toPrecision(3)))
}
