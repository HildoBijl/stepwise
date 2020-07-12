
import React, { useCallback } from 'react'

import { useExerciseData } from '../ExerciseContainer'
import { useFormData } from '../form/Form'
import { useRefWithValue } from '../../../util/react'

export function useButtons() {
	const { progress, submitting, submitAction, startNewExercise } = useExerciseData()
	const { input, isValid } = useFormData()

	// Set up refs to track state parameters.
	const inputRef = useRefWithValue(input)
	const disabledRef = useRefWithValue(submitting) // Do we disable all actions?

	// Set up button handlers.
	const submit = useCallback(() => {
		if (disabledRef.current)
			return
		if (!isValid())
			return
		return submitAction({ type: 'input', input: inputRef.current })
	}, [disabledRef, inputRef, isValid, submitAction])
	const giveUp = useCallback(() => {
		if (disabledRef.current)
			return
		return submitAction({ type: 'giveUp' })
	}, [disabledRef, submitAction])

	// Return the buttons.
	if (progress.done)
		return <p><button type="button" onClick={startNewExercise}>Next problem</button></p>
	return (
		<p>
			<button type="button" onClick={submit} disabled={disabledRef.current}>Submit</button>
			<button type="button" onClick={giveUp} disabled={disabledRef.current}>Give up</button>
		</p>
	)
}