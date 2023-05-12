import React, { Fragment, forwardRef } from 'react'

import { ensureNumber } from 'step-wise/util/numbers'
import { ensureBoolean, ensureBasicObject, processOptions } from 'step-wise/util/objects'
import { ensureFunction } from 'step-wise/util/functions'

import { useTransformationSettings, Group, Line, Label } from '../Drawing'

const defaultAxesOptions = {
	axisLineStyle: { opacity: 0.9, strokeWidth: 0.5 },
	tickLineStyle: { opacity: 0.9, strokeWidth: 0.5 },
	tickSize: 5,
	tickSizeOpposite: 0,
	showZeroTick: false,
	tickToElement: tick => <div style={{ transform: 'scale(0.75)' }}>{tick.toString().replace('-', '−')}</div>,
	gridLines: true,
	gridLineStyle: { opacity: 0.1, strokeWidth: 0.5 },
}

export const Axes = forwardRef(({ plotSettings, ...options }, ref) => {
	const { ticks, bounds } = useTransformationSettings()
	if (!ticks)
		throw new Error(`Missing Plot ticks data: expected a Plot with ticks provided, but these were not present in the transformation settings. Has some form of PlotTransformation been used to set up the transformation settings of the Drawing?`)

	// Process options.
	let { axisLineStyle, tickLineStyle, tickSize, tickSizeOpposite, showZeroTick, tickToElement, gridLines, gridLineStyle } = processOptions(options, defaultAxesOptions)
	axisLineStyle = ensureBasicObject(axisLineStyle)
	tickLineStyle = ensureBasicObject(tickLineStyle)
	tickSize = ensureNumber(tickSize, true)
	tickSizeOpposite = ensureNumber(tickSizeOpposite, true)
	showZeroTick = ensureBoolean(showZeroTick)
	tickToElement = ensureFunction(tickToElement)
	gridLines = ensureBoolean(gridLines)
	gridLineStyle = ensureBasicObject(gridLineStyle)

	return <Group ref={ref}>
		{/* Grid lines. */}
		{gridLines ? <Group>
			{ticks.map((ticksForAxis, axisIndex) => <Group key={axisIndex}>
				{ticksForAxis.map((tick, tickIndex) => <Fragment key={tickIndex}>
					<Line key={tickIndex} points={axisIndex === 0 ?
						[[tick, bounds.start.y], [tick, bounds.end.y]] :
						[[bounds.start.x, tick], [bounds.end.x, tick]]
					} style={gridLineStyle} />
				</Fragment>)}
			</Group>)}
		</Group> : null}

		{/* Axis lines. */}
		<Line points={[[bounds.start.x, 0], [bounds.end.x, 0]]} style={axisLineStyle} />
		<Line points={[[0, bounds.start.y], [0, bounds.end.y]]} style={axisLineStyle} />

		{/* Ticks for each axis. */}
		{ticks.map((ticksForAxis, axisIndex) => <Group key={axisIndex}>
			{ticksForAxis.map((tick, tickIndex) => {
				const point = { x: axisIndex === 0 ? tick : 0, y: axisIndex === 1 ? tick : 0 }
				const graphicalPoints = [
					{ x: axisIndex === 0 ? 0 : -tickSize, y: axisIndex === 1 ? 0 : -tickSizeOpposite },
					{ x: axisIndex === 0 ? 0 : tickSizeOpposite, y: axisIndex === 1 ? 0 : tickSize },
				]
				return tick !== 0 || showZeroTick ? <Fragment key={tickIndex}>
					<Label position={point} graphicalDistance={tickSize + (axisIndex === 0 ? -1 : 1)} angle={axisIndex === 0 ? Math.PI / 2 : Math.PI}>{tickToElement(tick)}</Label>
					<Line points={[point, point]} graphicalPoints={graphicalPoints} style={tickLineStyle} />
				</Fragment> : null
			})}
		</Group>)}
	</Group >
})
export default Axes
