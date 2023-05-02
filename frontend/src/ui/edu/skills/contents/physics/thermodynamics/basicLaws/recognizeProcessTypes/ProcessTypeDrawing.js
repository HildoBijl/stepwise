import React, { Fragment, useRef } from 'react'

import { firstOf, lastOf } from 'step-wise/util/arrays'
import { Transformation } from 'step-wise/geometry'
import { M } from 'ui/components'

import { Drawing, drawingComponents, useScaleToBoundsTransformationSettings, Element } from 'ui/components/figures'

const { Line: SvgLine, Curve: SvgCurve } = drawingComponents

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
		nGraphicalShift: [0, 1],
		color: '#0a6f3c',
	},
	{
		points: [[intersection[0], 0.2], [intersection[0], maxY]],
		name: 'Isochoor',
		nameAnchor: [0, 0],
		nameGraphicalShift: [5, 0],
		n: '\\infty',
		nAnchor: [1, 1],
		nGraphicalShift: [-5, 0],
		color: '#422814',
	},
	{
		points: [[1, maxY], intersection, [maxX, 1.2]],
		name: 'Isotherm',
		nameGraphicalShift: [0, -1],
		n: '1',
		nGraphicalShift: [-1, 0],
		color: '#044488',
	},
	{
		points: [[1.8, maxY], intersection, [maxX, 0.6]],
		name: 'Isentroop',
		nameGraphicalShift: [0, -2],
		n: 'k',
		nAnchor: [0, 0],
		nGraphicalShift: [10, 0],
		color: '#bd0f0f',
	},
]

export default function ProcessTypeDrawing() {
	const ref1 = useRef()
	const ref2 = useRef()

	console.log(ref1.current)
	console.log(ref2.current)
	window.r1 = ref1
	window.r2 = ref2

	const transformationSettings = useScaleToBoundsTransformationSettings([...xAxisPoints, ...yAxisPoints], {
		maxWidth: 400,
		pretransformation: Transformation.getReflection([0, 1]),
	})
	return <Drawing
		transformationSettings={transformationSettings}
		svgContents={<>
			<SvgLine points={xAxisPoints} ref={ref1} />
			<SvgLine points={yAxisPoints} />
			{processes.map((process, index) => <Fragment key={index}>
				<SvgCurve points={process.points} style={{ strokeWidth: 2, stroke: process.color }} />
			</Fragment>)}
		</>}
		htmlContents={<>
			<Element ref={ref2} anchor={[1, 0]} position={yAxisPoints[1]} graphicalShift={[-8, 10]}><M>p</M></Element>
			<Element anchor={[1, 0]} position={xAxisPoints[1]} graphicalShift={[-10, 5]}><M>V</M></Element>
			{processes.map((process, index) => <Fragment key={index}>
				<Element position={firstOf(process.points)} anchor={process.nAnchor || [1, 0]} graphicalShift={process.nGraphicalShift} style={{ color: process.color }}><M>n = {process.n}</M></Element>
				<Element position={lastOf(process.points)} anchor={process.nameAnchor || [1, 0]} graphicalShift={process.nameGraphicalShift} style={{ color: process.color, fontWeight: 'bold' }}>{process.name}</Element>
			</Fragment>)}
		</>}
	/>
}
