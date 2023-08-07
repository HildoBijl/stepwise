
import React, { forwardRef, Fragment } from 'react'

import { isObject, applyMapping } from 'step-wise/util/objects'

import { toCSS } from 'util/colors'

import { themeColor, feedbackColors } from 'ui/theme'
import { Group, components as drawingComponents } from 'ui/figures'

import * as engineeringComponents from './components'

const components = {
	...drawingComponents,
	...engineeringComponents,
}

export const loadColors = {
	input: '#b1a304',
	external: '#8e0b0b',
	reaction: '#043870',
	section: '#902dba',
	feedback: applyMapping(feedbackColors, toCSS),
	glow: toCSS(themeColor), // On selection.
}

// render takes a data object, checks its "type" parameter, and based on that tries to render it into the right component for the Engineering Diagram.
export function render(data, ref) {
	// For arrays make a group out of all individual elements.
	if (Array.isArray(data)) {
		return <Group ref={ref}>
			{data.map((element, index) => <Fragment key={index}>
				{render(element)}
			</Fragment>)}
		</Group>
	}

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
	return <Component ref={ref} {...applyStyling(data)} />
}

// EngineeringDiagramElement is just like the render function, but then functions as a React component.
export const EngineeringDiagramElement = forwardRef((data, ref) => {
	return render(data, ref)
})

// applyStyling checks if the data is the data of a load with a specified source. It then styles the load using this piece of information.
function applyStyling(data) {
	data = { ...data }

	// If there is a source, apply the respective color.
	if (data.source) {
		data.color = loadColors[data.source]
		delete data.source
	}

	return data
}
