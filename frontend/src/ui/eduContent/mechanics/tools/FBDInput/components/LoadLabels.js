import React from 'react'

import { isLoad } from '@step-wise/engineering-mechanics'

import { useInputValue, useDrawingInputData } from 'ui/inputs'

import { LoadLabel } from '../../EngineeringDiagram'

import { getDragObjectData } from '../support'

export function LoadLabels({ options }) {
	const { getLoadNames } = options
	let loads = useInputValue()
	const { mouseDownData, mouseData } = useDrawingInputData()

	// If no getLoadNames function has been provided, do not show anything.
	if (!getLoadNames)
		return null

	// Add the drag object as well.
	const dragObjectData = getDragObjectData(mouseDownData, mouseData, options)
	if (isLoad(dragObjectData))
		loads = [...loads, dragObjectData]

	// Obtain the names and render them.
	const loadNames = getLoadNames(loads)
	return loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)
}
