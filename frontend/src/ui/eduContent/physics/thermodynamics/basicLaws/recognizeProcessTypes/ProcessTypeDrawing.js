import React, { Fragment } from 'react'

import { first, last } from '@step-wise/js-utils'
import { M } from '@step-wise/math-display'

import { Drawing, Line as SvgLine, Curve as SvgCurve, HtmlElement } from '@step-wise/drawing'

// Define settings for the drawing.
const displacement = 0.2
const maxX = 6, maxY = 4
const xAxisPoints = [[-displacement, 0], [maxX, 0]]
const yAxisPoints = [[0, -displacement], [0, maxY]]
const intersection = [maxX / 2, maxY / 2]
const processes = [
	{
		points: [[0.2, intersection[1]], [maxX, intersection[1]]],
		name: 'Isobaar',
		n: '0',
		nAnchor: 'topLeft',
		nShift: [0, -1],
		color: '#0d8042',
	},
	{
		points: [[intersection[0], 0.2], [intersection[0], maxY]],
		name: 'Isochoor',
		nameAnchor: 'topLeft',
		nameShift: [5, 0],
		n: '\\infty',
		nAnchor: 'bottomRight',
		nShift: [-5, 0],
		color: '#422814',
	},
	{
		points: [[1, maxY], intersection, [maxX, 1.2]],
		name: 'Isotherm',
		nameShift: [0, 1],
		n: '1',
		nShift: [-1, 0],
		color: '#044488',
	},
	{
		points: [[1.8, maxY], intersection, [maxX, 0.6]],
		name: 'Isentroop',
		nameShift: [0, 2],
		n: 'k',
		nAnchor: 'topLeft',
		nShift: [10, 0],
		color: '#bd0f0f',
	},
]

export default function ProcessTypeDrawing() {
	return <Drawing view={{ type: 'fit', points: [...xAxisPoints, ...yAxisPoints], maxWidth: 400, yDirection: 'up' }}>
		{/* x-axis */}
		<SvgLine positions={xAxisPoints} />
		<HtmlElement anchor="topRight" position={{ position: xAxisPoints[1], pixelOffset: [-10, -5] }}><M>V</M></HtmlElement>

		{/* y-axis */}
		<SvgLine positions={yAxisPoints} />
		<HtmlElement anchor="topRight" position={{ position: yAxisPoints[1], pixelOffset: [-8, -10] }}><M>p</M></HtmlElement>

		{/* Curves */}
		{processes.map((process, index) => <Fragment key={index}>
			<SvgCurve positions={process.points} smoothing={{ mode: 'through' }} style={{ strokeWidth: 2, stroke: process.color }} />
			<HtmlElement position={{ position: first(process.points), pixelOffset: process.nShift }} anchor={process.nAnchor || 'topRight'} style={{ color: process.color }}><M>n = {process.n}</M></HtmlElement>
			<HtmlElement position={{ position: last(process.points), pixelOffset: process.nameShift }} anchor={process.nameAnchor || 'topRight'} style={{ color: process.color, fontWeight: 'bold' }}>{process.name}</HtmlElement>
		</Fragment>)}
	</Drawing>
}
