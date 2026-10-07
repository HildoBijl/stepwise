import type { LineProps } from '../primitives/svg/index.ts'
import { Line } from '../primitives/svg/index.ts'

import { usePlot } from './context.ts'

export interface GridProps {
	// Which grid lines should be drawn?
	x?: boolean
	y?: boolean
	excludeAxes?: boolean

	// What props should be passed to the underlying elements?
	lineProps?: Omit<LineProps, 'positions'>
	xLineProps?: Omit<LineProps, 'positions'>
	yLineProps?: Omit<LineProps, 'positions'>
}

export function Grid(props: GridProps) {
	const { excludeAxes = true, lineProps, x = true, xLineProps, y = true, yLineProps } = props
	const { domain, axes } = usePlot()

	// Render the grid lines for the x and y axes.
	return <>
		{x && axes.x.ticks.filter(value => !excludeAxes || value !== axes.y.position).map(value => <Line key={`x-${value}`} opacity={0.15} strokeWidth={0.5} {...lineProps} {...xLineProps} positions={[[value, domain.min.y], [value, domain.max.y]]} />)}
		{y && axes.y.ticks.filter(value => !excludeAxes || value !== axes.x.position).map(value => <Line key={`y-${value}`} opacity={0.15} strokeWidth={0.5} {...lineProps} {...yLineProps} positions={[[domain.min.x, value], [domain.max.x, value]]} />)}
	</>
}
