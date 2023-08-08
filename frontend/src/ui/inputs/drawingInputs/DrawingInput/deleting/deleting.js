import { useState } from 'react'

import { processOptions } from 'step-wise/util'

import { getUtilKeys } from 'util/dom'
import { useEventListener } from 'util/react'

import { useInputData } from '../../../Input'

export const defaultDeletingOptions = {
	applyDeletion: undefined, // The function that is called when a delete command is given.
	showDeleteButton: true, // Should the delete (garbage bin) button be shown (assuming there is an onDelete function)? Often this is a function (FI) => true/false, because this depends on whether there is a selection.
}

// useDeleting wraps all the deletion functionalities into one hook, including. It takes a drawing, a set of snappers and a snapping distance and takes care of all the mouse functionalities.
export function useDeleting(options) {
	let { applyDeletion, showDeleteButton } = processOptions(options, defaultDeletingOptions)

	// Use a state to track if the mouse is over the delete button.
	const [isMouseOverButton, setIsMouseOverButton] = useState(false)

	// Listen to key presses for deleting.
	const keyDownHandler = useDeletionKeyDownHandler(applyDeletion)
	useEventListener('keydown', keyDownHandler)

	// Return data that is useful for the context.
	return { applyDeletion, showDeleteButton, isMouseOverButton, setIsMouseOverButton }
}

// useDeletionKeyDownHandler gives a handling function that receives an event and apply the given delete function if the event was actually a delete key being pressed.
export function useDeletionKeyDownHandler(applyDeletion) {
	// Get data from parent components.
	const { readOnly, active, setFI } = useInputData()

	// Set up and return the handler.
	return (event) => {
		// Do nothing if the field is not accessible and active.
		if (readOnly || !active)
			return

		// On a delete remove all selected loads.
		if (applyDeletion && (event.key === 'Delete' || event.key === 'Backspace')) {
			event.preventDefault()
			return setFI(FI => applyDeletion(FI, getUtilKeys(event)))
		}
	}
}
