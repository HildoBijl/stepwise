import React, { useEffect, useRef } from 'react'

import { useExerciseData } from '../components/ExerciseLoader'
import { useFormParameter } from '../components/Form'

export default function IntegerInput({ name, positive = false }) {
	const { done } = useExerciseData()
	const [input, setInput] = useFormParameter(name)

	const fieldRef = useRef(null)
	const cursorPositionRef = useRef(0)

	const value = (input && input.value) || ''
	const editable = !done

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

	return <input type="text" name={name} value={value} disabled={!editable} onChange={handleChange} />
}