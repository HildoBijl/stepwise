import { useRef, useCallback } from 'react'

import { getMultipleChoiceMapping } from 'step-wise/eduTools'

import { useLatest } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests due to Jest using the Node util package instead.

// useStableMapping sets up a mapping (given various options) between the available options and which should be placed where. For instance, with six options, a mapping may be [4,0,2,5] to indicate to first show option 4, then option 0, then option 2 and then option 5. Options 1 and 3 are not displayed.
export function useStableMapping(numChoices, pick, include, randomOrder) {
	// Set up a ref for stability.
	const mappingRef = useRef()

	// If the mapping is not present, generate one.
	if (!mappingRef.current)
		mappingRef.current = getMultipleChoiceMapping({ numChoices, pick, include, randomOrder })

	// Return the mapping that was divised.
	return mappingRef.current
}

// useSelectionHandlers gives functions to read/write the selection parameter.
export function useSelectionHandlers(selection, setSelection, multiple, readOnly) {
	const selectionRef = useLatest(selection)
	const readOnlyRef = useLatest(readOnly)

	const isChecked = useCallback((index) => multiple ?
		selectionRef.current.includes(index) :
		selectionRef.current === index,
		[multiple, selectionRef])

	const activateItem = useCallback((index) => !readOnlyRef.current && (multiple ?
		setSelection(selection => [...selection, index]) :
		setSelection(index)),
		[multiple, readOnlyRef, setSelection])

	const deactivateItem = useCallback((index) => !readOnlyRef.current && (multiple ?
		setSelection(selection => selection.filter(item => item !== index)) :
		setSelection(undefined)),
		[multiple, readOnlyRef, setSelection])

	const toggleItem = useCallback((index) => isChecked(index) ?
		deactivateItem(index) :
		activateItem(index),
		[isChecked, activateItem, deactivateItem])

	return { isChecked, activateItem, deactivateItem, toggleItem }
}
