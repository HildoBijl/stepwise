import React from 'react'

import { useInputValue, useDrawingInputData } from 'ui/inputs'
import { loadTypes } from 'step-wise/eduContent/util/engineeringMechanics'

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
	if (dragObjectData && Object.values(loadTypes).includes(dragObjectData.type))
		loads = [...loads, dragObjectData]

	// Obtain the names and render them.
	const loadNames = getLoadNames(loads)
	return loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)
}
