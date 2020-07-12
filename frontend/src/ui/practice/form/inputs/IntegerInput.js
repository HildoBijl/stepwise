import React, { useEffect, useRef } from 'react'

import { useExerciseData } from '../../ExerciseContainer'
import { useFormParameter, useFieldValidation } from '../Form'
import { useParameterFeedback } from '../FeedbackProvider'

export default function IntegerInput({ name, positive = false, validate = nonEmpty }) {
	const { progress } = useExerciseData()
	const [input, setInput] = useFormParameter(name)
	const { validation, validationInput } = useFieldValidation(name, validate)

	const fieldRef = useRef(null)
	const cursorPositionRef = useRef(0)

	const value = getValue(input)
	const editable = !progress.done

	// Determine which feedback to give, based on validation results and feedback.
	const { feedback, prevInput } = useParameterFeedback(name)
	let feedbackText = ''
	if (validation !== undefined && value === getValue(validationInput)) {
		feedbackText = 'Validation problem: ' + validation
	} else if (feedback !== undefined && value === getValue(prevInput)) {
		if (typeof feedback === 'boolean')
			feedbackText = (feedback ? 'Correct' : 'Wrong')
		else
			feedbackText = feedback.text
	}

	// Set up change handler.
	const handleChange = evt => {
		// Extract data.
		fieldRef.current = evt.target
		const input = fieldRef.current.value

		// Find the new desired cursor position.
		const oldCursorPosition = evt.target.selectionStart
		const useMinusSign = !positive && input.charAt(0) === '-'
		const numNumbersBeforeCursor = (input.substring(0, oldCursorPosition).match(/[0-9]/g) || []).length
		cursorPositionRef.current = numNumbersBeforeCursor + (useMinusSign ? 1 : 0)

		// Adjust the input, clearing non-valid characters, and store it.
		const newInput = (useMinusSign ? '-' : '') + input.replace(/[^0-9]/g, '')
		setInput({ type: 'Integer', value: newInput })
	}

	// On updates set the cursor position accordingly.
	useEffect(() => {
		if (fieldRef.current)
			fieldRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current)
	})

	return <>
		<input type="text" name={name} value={value} disabled={!editable} onChange={handleChange} />
		{feedbackText ? <span> {feedbackText}</span> : null}
	</>
}

function getValue(input) {
	return (input && input.value) || ''
}

// These are validation functions.
export function nonEmpty(input) {
	if (getValue(input) === '')
		return 'Field is empty'
}