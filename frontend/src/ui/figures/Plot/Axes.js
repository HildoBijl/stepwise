import React, { Fragment, forwardRef } from 'react'

import { ensureNumber, ensureBoolean, ensureBasicObject, processOptions, firstOf, lastOf, ensureFunction } from 'step-wise/util'

import { ensureReactElement } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

import { useTransformationSettings, Group, Line, Label } from '../Drawing'

export const defaultAxesOptions = {
	axisLineStyle: { opacity: 0.9, strokeWidth: 0.5 },
	tickLineStyle: { opacity: 0.9, strokeWidth: 0.5 },
	tickSize: 5,
	tickSizeOpposite: 0,
	showZeroTick: false,
	tickToElement: tick => tick.toString().replace('-', '−'),
	gridLines: true,
	gridLineStyle: { opacity: 0.1, strokeWidth: 0.5 },
	xLabel: undefined,
	yLabel: undefined,
	labelStyle: undefined,
	xLabelShift: 0,
	yLabelShift: 0,
	textScale: 0.65,
}

export const Axes = forwardRef(({ plotSettings, ...options }, ref) => {
	const { ticks, bounds } = useTransformationSettings()
	if (!ticks)
		throw new Error(`Missing Plot ticks data: expected a Plot with ticks provided, but these were not present in the transformation settings. Has some form of PlotTransformation been used to set up the transformation settings of the Drawing?`)

	// Process options.
	let { axisLineStyle, tickLineStyle, tickSize, tickSizeOpposite, showZeroTick, tickToElement, gridLines, gridLineStyle, xLabel, yLabel, xLabelShift, yLabelShift, textScale } = processOptions(options, defaultAxesOptions)
	axisLineStyle = ensureBasicObject(axisLineStyle)
	tickLineStyle = ensureBasicObject(tickLineStyle)
	tickSize = ensureNumber(tickSize, true)
	tickSizeOpposite = ensureNumber(tickSizeOpposite, true)
	showZeroTick = ensureBoolean(showZeroTick)
	tickToElement = ensureFunction(tickToElement)
	gridLines = ensureBoolean(gridLines)
	gridLineStyle = ensureBasicObject(gridLineStyle)
	xLabel = xLabel && ensureReactElement(xLabel)
	yLabel = yLabel && ensureReactElement(yLabel)
	xLabelShift = ensureNumber(xLabelShift)
	yLabelShift = ensureNumber(yLabelShift)
	textScale = ensureNumber(textScale, true, true)

	return <Group ref={ref}>
		{/* Grid lines. */}
		{gridLines ? <Group>
			{ticks.map((ticksForAxis, axisIndex) => <Group key={axisIndex}>
				{ticksForAxis.map((tick, tickIndex) => <Fragment key={tickIndex}>
					<Line key={tickIndex} points={axisIndex === 0 ?
						[[tick, firstOf(ticks[1])], [tick, lastOf(ticks[1])]] :
						[[firstOf(ticks[0]), tick], [lastOf(ticks[0]), tick]]
					} style={gridLineStyle} />
				</Fragment>)}
			</Group>)}
		</Group> : null}

		{/* Axis lines. */}
		<Line points={[[firstOf(ticks[0]), 0], [lastOf(ticks[0]), 0]]} style={axisLineStyle} />
		<Line points={[[0, firstOf(ticks[1])], [0, lastOf(ticks[1])]]} style={axisLineStyle} />

		{/* Ticks for each axis. */}
		{ticks.map((ticksForAxis, axisIndex) => <Group key={axisIndex}>
			{ticksForAxis.map((tick, tickIndex) => {
				const point = { x: axisIndex === 0 ? tick : 0, y: axisIndex === 1 ? tick : 0 }
				const graphicalPoints = [
					{ x: axisIndex === 0 ? 0 : -tickSize, y: axisIndex === 1 ? 0 : -tickSizeOpposite },
					{ x: axisIndex === 0 ? 0 : tickSizeOpposite, y: axisIndex === 1 ? 0 : tickSize },
				]
				return tick !== 0 || showZeroTick ? <Fragment key={tickIndex}>
					<Label position={point} graphicalDistance={tickSize + (axisIndex === 0 ? -1 : 2)} angle={axisIndex === 0 ? Math.PI / 2 : Math.PI} scale={textScale}>{tickToElement(tick)}</Label>
					<Line points={[point, point]} graphicalPoints={graphicalPoints} style={tickLineStyle} />
				</Fragment> : null
			})}
		</Group>)}

		{/* Axis labels. */}
		{xLabel ? <Label position={[bounds.middle.x, 0]} graphicalDistance={tickSize + 12 + xLabelShift} angle={Math.PI / 2} scale={textScale}>{xLabel}</Label> : null}
		{yLabel ? <Label position={[0, bounds.middle.y]} graphicalDistance={tickSize + 17 + yLabelShift} angle={Math.PI} rotate={-Math.PI / 2} scale={textScale}>{yLabel}</Label> : null}
	</Group >
})
