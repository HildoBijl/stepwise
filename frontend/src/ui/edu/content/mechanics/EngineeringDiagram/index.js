// An Engineering Diagram allows for the easy creation of structural drawings. It can easily draw forces, moments, beams, hinges, supports and more.

import React, { Fragment, forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { isObject, processOptions, filterOptions } from 'step-wise/util/objects'

import Drawing, { defaultOptions as drawingDefaultOptions } from 'ui/components/figures/Drawing'

import * as components from './components'

export * from './components'

const defaultOptions = {
	width: drawingDefaultOptions.width,
	height: drawingDefaultOptions.height,
	maxWidth: drawingDefaultOptions.maxWidth,
	parts: null,
	elements: null,
}
export { defaultOptions }

const useStyles = makeStyles((theme) => ({
	engineeringDiagram: {
		'& svg': {
			'& .line, & .distance': {
				fill: 'none',
				stroke: 'black',
				'stroke-width': 1,
			},
			'& .distance': {
				'marker-start': 'url(#distanceArrowHead)',
				'marker-end': 'url(#distanceArrowHead)',
			},
			'& .forceLine': {
				fill: 'none',
			},
			'& .momentLine': {
				fill: 'none',
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
	options = processOptions(options, defaultOptions)
	const classes = useStyles()

	// Add SVG objects to the diagram, based on the provided parts.
	options.svgContents = options.parts && renderData(options.parts)
	options.svgDefs = <EngineeringDiagramDefs />
	options.positionedElements = options.elements

	// Render the drawing.
	options.className = clsx('engineeringDiagram', classes.engineeringDiagram, options.className)
	return <Drawing ref={ref} {...filterOptions(options, drawingDefaultOptions)} />
}
export const EngineeringDiagram = forwardRef(EngineeringDiagramUnforwared)
export default EngineeringDiagram

// EngineeringDiagramDefs are SVG defs needed inside the SVG. We put them into the Drawing.
function EngineeringDiagramDefs() {
	return <>
		<marker id="distanceArrowHead" key="distanceArrowHead" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto-start-reverse">
			<path d="M0 0 L12 6 L0 12" stroke="black" strokeWidth="1" fill="none" />
		</marker>,
		<marker id="forceArrowHead" key="forceArrowHead" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse">
			<polygon points="8 4, 0 0, 2 4, 0 8" />
		</marker>
	</>
}

// renderData takes a data object and distributes it over the various rendering functions.
export function renderData(data) {
	// For arrays make a group out of all individual elements.
	if (Array.isArray(data))
		return <g>{data.map((element, index) => <Fragment key={index}>{renderData(element)}</Fragment>)}</g>

	// Ensure it's an object.
	if (!isObject(data))
		throw new Error(`Invalid Engineering Diagram data: expected an object or array, but received an input of type "${typeof data}".`)

	// If it's already a React element, do nothing.
	if (React.isValidElement(data))
		return data

	// Make sure it's a known component type.
	const Component = components[data.type]
	if (!Component)
		throw new Error(`Invalid Engineering Diagram data: received an object with type property "${data.type}". Could not render this.`)

	// Render the requested component.
	return <Component {...data} />
}

// Group takes a group object and turns all parameters of the object (apart from its type "group" and a potential group className and style) into SVG children of this group. Note that this set-up is more powerful than using an array to create a group, because it allows the same object to be linked to the same React key to prevent references from shifting. In practice it's not used much, since the same can be obtained by manually defining keys in React.
export function Group(props) {
	const keys = Object.keys(props).filter(key => !['type', 'style', 'className'].includes(key))
	return <g className={props.className} style={props.style}>{keys.map(key => <Fragment key={key}>{renderData[props[key]]}</Fragment>)}</g>
}
