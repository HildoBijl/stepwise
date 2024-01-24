import React, { Fragment } from 'react'

import { firstOf, lastOf } from 'step-wise/util'
import { Transformation } from 'step-wise/geometry'

import { M } from 'ui/components'
import { Drawing, Line as SvgLine, Curve as SvgCurve, useBoundsBasedTransformationSettings, Element } from 'ui/figures'

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
		nAnchor: [0, 0],
		nShift: [0, 1],
		color: '#0d8042',
	},
	{
		points: [[intersection[0], 0.2], [intersection[0], maxY]],
		name: 'Isochoor',
		nameAnchor: [0, 0],
		nameShift: [5, 0],
		n: '\\infty',
		nAnchor: [1, 1],
		nShift: [-5, 0],
		color: '#422814',
	},
	{
		points: [[1, maxY], intersection, [maxX, 1.2]],
		name: 'Isotherm',
		nameShift: [0, -1],
		n: '1',
		nShift: [-1, 0],
		color: '#044488',
	},
	{
		points: [[1.8, maxY], intersection, [maxX, 0.6]],
		name: 'Isentroop',
		nameShift: [0, -2],
		n: 'k',
		nAnchor: [0, 0],
		nShift: [10, 0],
		color: '#bd0f0f',
	},
]

export default function ProcessTypeDrawing() {
	const transformationSettings = useBoundsBasedTransformationSettings([...xAxisPoints, ...yAxisPoints], {
		maxWidth: 400,
		pretransformation: Transformation.verticalFlip,
	})
	return <Drawing transformationSettings={transformationSettings}>
		{/* x-axis */}
		<SvgLine points={xAxisPoints} />
		<Element anchor={[1, 0]} position={xAxisPoints[1]} graphicalPosition={[-10, 5]}><M>V</M></Element>

		{/* y-axis */}
		<SvgLine points={yAxisPoints} />
		<Element anchor={[1, 0]} position={yAxisPoints[1]} graphicalPosition={[-8, 10]}><M>p</M></Element>

		{/* Curves */}
		{processes.map((process, index) => <Fragment key={index}>
			<SvgCurve points={process.points} style={{ strokeWidth: 2, stroke: process.color }} />
			<Element position={firstOf(process.points)} graphicalPosition={process.nShift} anchor={process.nAnchor || [1, 0]} style={{ color: process.color }}><M>n = {process.n}</M></Element>
			<Element position={lastOf(process.points)} graphicalPosition={process.nameShift} anchor={process.nameAnchor || [1, 0]} style={{ color: process.color, fontWeight: 'bold' }}>{process.name}</Element>
		</Fragment>)}
	</Drawing>
}
