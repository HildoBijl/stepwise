import React, { useEffect } from 'react'

import { getParameterResult } from 'step-wise/edu/util/exercises'
import { useExerciseData } from '../components/Exercise'

// Set up memory for updating the cursor position.
let cursorPosition = 0
let field

export default function IntegerInput({ name, positive = false }) {
	const { input, prevInput, result, setInputParameter, done } = useExerciseData()

	const value = (input && input[name] && input[name].value) || ''
	const editable = !done && (!result || result[name] === undefined)

	const submissionResult = getParameterResult(name, result)
	const prevValue = (prevInput && prevInput[name] && prevInput[name].value) || ''

	const handleChange = evt => {
		// Extract data.
		field = evt.target // Remember the field.
		const input = field.value

		// Find the new desired cursor position.
		const oldCursorPosition = evt.target.selectionStart
		const useMinusSign = !positive && input.charAt(0) === '-'
		const numNumbersBeforeCursor = (input.substring(0, oldCursorPosition).match(/[0-9]/g) || []).length
		cursorPosition = numNumbersBeforeCursor + (useMinusSign ? 1 : 0)

		// Adjust the input, clearing non-valid characters, and store it.
		const newInput = (useMinusSign ? '-' : '') + input.replace(/[^0-9]/g, '')
		setInputParameter(name, { type: 'Integer', value: newInput })
	}

	// On updates set the cursor position accordingly.
	useEffect(() => {
		if (field)
			field.setSelectionRange(cursorPosition, cursorPosition)
	})

	// Determine feedback. [This is a temporary way. Later on it should be graphically formatted.]
	let feedback
	if (submissionResult === true) {
		feedback = 'Correct'
	} else if (submissionResult === false && value === prevValue) {
		feedback = 'Wrong'
	}

	return <>
		<input type="text" name={name} value={value} disabled={!editable} onChange={handleChange} />
		{feedback ? <span> {feedback}</span> : null}
	</>
}