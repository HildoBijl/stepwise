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
	pointToLabel: undefined,
}

const defaultLabelStyle = theme => ({
	background: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	borderRadius: 8,
	fontWeight: 'bold',
	padding: '1px 5px',
})

const labelAngles = [[3 / 4, 1 / 2, 1 / 4], [1, -1 / 4, 0], [-3 / 4, 1 / 2, -1 / 4]].map(list => list.map(angle => angle * Math.PI))

export const MouseLines = forwardRef(({ plotSettings, ...options }, ref) => {
	const theme = useTheme()
	const { plotBounds } = useTransformationSettings()
	const mousePosition = useMousePosition()
	const mouseInPlot = !!mousePosition && plotBounds.contains(mousePosition)

	// Process options.
	let { lineStyle, circleStyle, showAxisLabels, labelStyle, valueToLabel, xValueToLabel, yValueToLabel, pointToLabel } = processOptions(options, defaultMouseLinesOptions)
	lineStyle = ensureBasicObject(lineStyle)
	circleStyle = ensureBasicObject(circleStyle)
	showAxisLabels = ensureBoolean(showAxisLabels)
	labelStyle = ensureBasicObject(labelStyle)
	valueToLabel = ensureFunction(valueToLabel)
	xValueToLabel = xValueToLabel && ensureFunction(xValueToLabel)
	yValueToLabel = yValueToLabel && ensureFunction(yValueToLabel)
	pointToLabel = pointToLabel && ensureFunction(pointToLabel)

	// When the mouse is not present, render nothing. Keep the empty group for reference purposes.
	if (!mousePosition || !mouseInPlot)
		return <Group ref={ref} />

	// Render everything.
	const appliedLabelStyle = { ...defaultLabelStyle(theme), ...labelStyle }
	const pointLabel = mousePosition && pointToLabel && pointToLabel(mousePosition)
	return <Group ref={ref}>
		{/* Line and marker. */}
		<Line points={[
			[0, mousePosition.y],
			mousePosition,
			[mousePosition.x, 0],
		]} style={{ stroke: theme.palette.primary.main, strokeWidth: 1, strokeDasharray: [4, 2], ...lineStyle }} />
		<Circle center={mousePosition} graphicalRadius={2} style={{ fill: theme.palette.primary.main, ...circleStyle }} />

		{/* Axis labels. */}
		{showAxisLabels ? <>
			<Label position={[mousePosition.x, 0]} graphicalDistance={2} angle={(mousePosition.y >= 0 ? 1 : -1) * Math.PI / 2} scale={0.75}>
				<div style={appliedLabelStyle}>{(xValueToLabel || valueToLabel)(mousePosition.x)}</div>
			</Label>
			<Label position={[0, mousePosition.y]} graphicalDistance={2} angle={mousePosition.x >= 0 ? Math.PI : 0} scale={0.75}>
				<div style={appliedLabelStyle}>{(yValueToLabel || valueToLabel)(mousePosition.y)}</div>
			</Label>
		</> : null}

		{/* Point label. */}
		{pointLabel ? <>
			<Label position={mousePosition} graphicalDistance={3} angle={labelAngles[Math.sign(mousePosition.y) + 1][Math.sign(mousePosition.x) + 1]} scale={0.75}>
				<div style={appliedLabelStyle}>{pointLabel}</div>
			</Label>
		</> : null}
	</Group >
})
export default MouseLines
