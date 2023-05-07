import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles, useTheme } from '@material-ui/core/styles'

import { processOptions, filterOptions, filterProperties } from 'step-wise/util/objects'

import { Drawing, defaultDrawingOptions } from 'ui/components/figures'

import { render } from './rendering'

export const defaultEngineeringDiagramOptions = {
	...filterProperties(defaultDrawingOptions, ['transformationSettings', 'maxWidth', 'svgContents', 'htmlContents', 'className'], false),
}

const useStyles = makeStyles((theme) => ({
	engineeringDiagram: {
		'& svg': {
			'& .supportTriangle': {
				fill: 'white',
			},
			'& .supportBlock': {
				'stroke-width': 0,
			},
			'& .wheel': {
				'stroke-width': 0,
			},
		},
	},
}))

function EngineeringDiagramUnforwared(options, ref) {
	options = processOptions(options, defaultEngineeringDiagramOptions)
	const classes = useStyles()

	// Add SVG objects to the diagram, based on the provided parts.
	options.svgDefs = options.svgDefs ? <>{options.svgDefs}<EngineeringDiagramDefs /></> : <EngineeringDiagramDefs />
	options.svgContents = options.svgContents && render(options.svgContents)

	// Render the drawing.
	options.className = clsx('engineeringDiagram', classes.engineeringDiagram, options.className)
	return <Drawing ref={ref} {...filterOptions(options, defaultDrawingOptions)} />
}
export const EngineeringDiagram = forwardRef(EngineeringDiagramUnforwared)
export default EngineeringDiagram

// EngineeringDiagramDefs are SVG defs needed inside the SVG. We put them into the Drawing.
function EngineeringDiagramDefs() {
	const theme = useTheme()
	return <>
		{[0, 0.6, 1.6, 1].map((value, index) => <filter key={index} id={`selectionFilter${index}`}>
			<feGaussianBlur stdDeviation="3" in="SourceGraphic" result="Blur" />
			<feComposite operator="out" in="Blur" in2="SourceGraphic" result="OuterBlur" />
			<feComponentTransfer in="OuterBlur" result="OuterBlurFaded">
				<feFuncA type="linear" slope={value} />
			</feComponentTransfer>
			<feFlood width="100%" height="100%" floodColor={theme.palette.primary.main} result="Color" />
			<feComposite operator="in" in="Color" in2="OuterBlurFaded" result="Glow" />
			<feMerge>
				<feMergeNode in="Glow" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>)}
	</>
}
