import React, { Fragment, forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles, useTheme } from '@material-ui/core/styles'

import { processOptions, filterOptions } from 'step-wise/util/objects'

import Drawing, { defaultDrawingInputOptions } from 'ui/components/figures/Drawing'

import { render } from './rendering'

export const defaultEngineeringDiagramOptions = {
	width: defaultDrawingInputOptions.width,
	height: defaultDrawingInputOptions.height,
	maxWidth: defaultDrawingInputOptions.maxWidth,
	svgContents: null,
	htmlContents: null,
	className: '',
}

const useStyles = makeStyles((theme) => ({
	engineeringDiagram: {
		'& svg': {
			'& .distance': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
				'marker-start': 'url(#distanceArrowHead)',
				'marker-end': 'url(#distanceArrowHead)',
			},
			'& .force': {
				'& .forceLine': {
					fill: 'none',
				},
			},
			'& .moment': {
				'& .momentLine': {
					fill: 'none',
				},
			},
			'& .arrowHead': {
				fill: 'black',
				'stroke-width': 0,
			},
			'& .beamLine': {
				fill: 'none',
			},
			'& .beamStrut': {
				'stroke-width': 0,
			},
			'& .hinge': {
				fill: 'white',
			},
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
	options.svgDefs = <EngineeringDiagramDefs />
	options.svgContents = options.svgContents && render(options.svgContents)

	// Render the drawing.
	options.className = clsx('engineeringDiagram', classes.engineeringDiagram, options.className)
	return <Drawing ref={ref} {...filterOptions(options, defaultDrawingInputOptions)} />
}
export const EngineeringDiagram = forwardRef(EngineeringDiagramUnforwared)
export default EngineeringDiagram

// EngineeringDiagramDefs are SVG defs needed inside the SVG. We put them into the Drawing.
function EngineeringDiagramDefs() {
	const theme = useTheme()
	return <>
		<marker id="distanceArrowHead" key="distanceArrowHead" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto-start-reverse">
			<path d="M0 0 L12 6 L0 12" stroke="black" strokeWidth="1" fill="none" />
		</marker>
		<marker id="forceArrowHead" key="forceArrowHead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse">
			<polygon points="8 4, 0 0, 2 4, 0 8" />
		</marker>
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
