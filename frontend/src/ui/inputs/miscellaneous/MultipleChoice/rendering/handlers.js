import { useRef, useCallback } from 'react'

import { numberArray, shuffle, getRandomSubset } from 'step-wise/util'

import { useLatest } from 'util/react'

// useStableMapping sets up a mapping (given various options) between the available options and which should be placed where. For instance, with six options, a mapping may be [4,0,2,5] to indicate to first show option 4, then option 0, then option 2 and then option 5. Options 1 and 3 are not displayed.
export function useStableMapping(numChoices, pick, include, randomOrder) {
	// Set up a ref for stability.
	const mappingRef = useRef()

	// Set up a function that can give us a mapping.
	const getMapping = useCallback(() => {
		let newMapping
		if (pick === undefined) {
			newMapping = numberArray(0, numChoices - 1) // Show all choices.
		} else {
			const includeArray = (include === undefined ? [] : (Array.isArray(include) ? include : [include])) // Use [] as a default value and ensure it's an array.
			const nonIncluded = numberArray(0, numChoices - 1).filter(index => !includeArray.includes(index)) // List all elements we may still select (those that are not automatically included).
			const numExtra = Math.max(pick - includeArray.length, 0) // How many should we still pick?
			newMapping = [...includeArray, ...getRandomSubset(nonIncluded, numExtra)]
		}
		return randomOrder ? shuffle(newMapping) : newMapping.sort((a, b) => a - b)
	}, [numChoices, pick, include, randomOrder])

	// If the mapping is not appropriate, generate new one.
	if (!mappingRef.current)
		mappingRef.current = getMapping()

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