import { Fragment, type ReactNode } from 'react'

import { ensureBoolean, ensureNumber } from '@step-wise/js-utils'

import { Label, type LabelProps } from '../../primitives/html/index.ts'
import { Line, type LineProps } from '../../primitives/svg/index.ts'

import { usePlot, usePlotAxis } from '../context.ts'

export interface AxisProps {
	// What should be shown for this axis?
	showLine?: boolean
	showTicks?: boolean
	showTickLabels?: boolean
	showZeroTick?: boolean

	// What labels and ticks do we have?
	label?: ReactNode
	formatTick?: (value: number, index: number) => ReactNode

	// How should the axis be styled?
	tickSize?: number
	oppositeTickSize?: number
	tickLabelOffset?: number
	labelOffset?: number

	// What props should be passed to the underlying elements?
	lineProps?: Omit<LineProps, 'positions'>
	tickProps?: Omit<LineProps, 'positions'>
	labelProps?: Omit<LabelProps, 'angle' | 'children' | 'distance' | 'position'>
	tickLabelProps?: Omit<LabelProps, 'angle' | 'children' | 'distance' | 'position'>
}

export function Axis({ axis, ...props }: AxisProps & { axis: 'x' | 'y' }) {
	// Load the provided props and the plot context.
	const { formatTick = defaultTickFormatter, label, labelOffset = 32, labelProps, lineProps, oppositeTickSize = 3, showLine = true, showTickLabels = true, showTicks = true, showZeroTick = false, tickLabelOffset = 5, tickLabelProps, tickProps, tickSize = 5 } = props
	const { domain } = usePlot()
	const resolvedAxis = usePlotAxis(axis)

	// Determine the positions of the axis lines.
	const { position } = resolvedAxis
	const mainBounds = resolvedAxis.domain
	const linePositions = axis === 'x' ? [[mainBounds[0], position], [mainBounds[1], position]] : [[position, mainBounds[0]], [position, mainBounds[1]]]

	// Determine the positions of the ticks, their size, and where their label should go.
	const ticks = resolvedAxis.ticks.filter(value => ensureBoolean(showZeroTick) || value !== 0)
	const resolvedTickSize = ensureNumber(tickSize, { nonNegative: true })
	const resolvedOppositeTickSize = ensureNumber(oppositeTickSize, { nonNegative: true })
	const outwardAngle = axis === 'x' ? -Math.PI / 2 : Math.PI

	// Render the axis line, ticks, tick labels, and axis label.
	return <>
		{/* Axis line. */}
		{ensureBoolean(showLine) && <Line strokeWidth={1} {...lineProps} positions={linePositions} />}

		{/* Ticks. */}
		{ticks.map((value, index) => {
			const point = axis === 'x' ? [value, position] : [position, value]
			const startOffset = axis === 'x' ? [0, -resolvedTickSize] : [-resolvedTickSize, 0]
			const endOffset = axis === 'x' ? [0, resolvedOppositeTickSize] : [resolvedOppositeTickSize, 0]
			return <Fragment key={value}>
				{/* Tick lines. */}
				{ensureBoolean(showTicks) && <Line strokeWidth={1} {...tickProps} positions={[{ position: point, pixelOffset: startOffset }, { position: point, pixelOffset: endOffset }]} />}

				{/* Tick labels. */}
				{ensureBoolean(showTickLabels) && <Label scale={0.85} {...tickLabelProps} angle={outwardAngle} distance={{ pixelDistance: resolvedTickSize + ensureNumber(tickLabelOffset) }} position={point}>{formatTick(value, index)}</Label>}
			</Fragment>
		})}

		{/* Axis label. */}
		{label !== undefined && <Label {...labelProps} angle={outwardAngle} distance={{ pixelDistance: ensureNumber(labelOffset) }} position={axis === 'x' ? [domain.midpoint.x, position] : [position, domain.midpoint.y]} rotate={axis === 'y' ? Math.PI / 2 : 0}>{label}</Label>}
	</>
}

function defaultTickFormatter(value: number): string {
	return String(value)
}
