import React, { forwardRef } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { roundToDigits } from 'step-wise/util/numbers'
import { ensureBoolean, ensureBasicObject, processOptions } from 'step-wise/util/objects'
import { ensureFunction } from 'step-wise/util/functions'

import { useTransformationSettings, useMousePosition, Group, Line, Circle, Label } from '../Drawing'

const defaultMouseLinesOptions = {
	lineStyle: {},
	circleStyle: {},
	showAxisLabels: true,
	labelStyle: {},
	valueToLabel: x => roundToDigits(x, 3),
	xValueToLabel: undefined,
	yValueToLabel: undefined,
}

const defaultLabelStyle = theme => ({
	background: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	borderRadius: 8,
	fontWeight: 'bold',
	padding: '1px 5px',
})

export const MouseLines = forwardRef(({ plotSettings, ...options }, ref) => {
	const theme = useTheme()
	const { bounds } = useTransformationSettings()
	const mousePosition = useMousePosition()
	const mouseInPlot = !!mousePosition && bounds.contains(mousePosition)

	// Process options.
	let { lineStyle, circleStyle, showAxisLabels, labelStyle, valueToLabel, xValueToLabel, yValueToLabel } = processOptions(options, defaultMouseLinesOptions)
	lineStyle = ensureBasicObject(lineStyle)
	circleStyle = ensureBasicObject(circleStyle)
	showAxisLabels = ensureBoolean(showAxisLabels)
	labelStyle = ensureBasicObject(labelStyle)
	valueToLabel = ensureFunction(valueToLabel)
	xValueToLabel = xValueToLabel && ensureFunction(xValueToLabel)
	yValueToLabel = yValueToLabel && ensureFunction(yValueToLabel)

	// When the mouse is not present, render nothing. Keep the empty group for reference purposes.
	if (!mousePosition || !mouseInPlot)
		return <Group ref={ref} />

	// Render everything.
	const appliedLabelStyle = { ...defaultLabelStyle(theme), ...labelStyle }
	return <Group ref={ref}>
		{/* Line and marker. */}
		<Line points={[
			[0, mousePosition.y],
			mousePosition,
			[mousePosition.x, 0],
		]} style={{ stroke: theme.palette.primary.main, strokeWidth: 1, strokeDasharray: [4, 2], ...lineStyle }} />
		<Circle center={mousePosition} graphicalRadius={2} style={{ fill: theme.palette.primary.main, ...circleStyle }} />

		{/* Axis elements. */}
		{showAxisLabels ? <>
			<Label position={[mousePosition.x, 0]} graphicalDistance={2} angle={(mousePosition.y >= 0 ? 1 : -1) * Math.PI / 2} scale={0.75}><div style={appliedLabelStyle}>{(xValueToLabel || valueToLabel)(mousePosition.x)}</div></Label>
			<Label position={[0, mousePosition.y]} graphicalDistance={2} angle={mousePosition.x >= 0 ? Math.PI : 0} scale={0.75}><div style={appliedLabelStyle}>{(yValueToLabel || valueToLabel)(mousePosition.y)}</div></Label>
		</> : null}
	</Group >
})
export default MouseLines
