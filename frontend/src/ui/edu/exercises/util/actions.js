
import { useCallback } from 'react'

import { deepEquals } from 'step-wise/util/objects'
import { lastOf } from 'step-wise/util/arrays'

import { useRefWithValue } from 'util/react'
import { useFormData } from 'ui/form/Form'

import { useExerciseData } from '../ExerciseContainer'

export function useSubmitAction() {
	const { submitting, submitAction, history } = useExerciseData()
	const { getCleanInput, isValid } = useFormData()

	const historyRef = useRefWithValue(history)
	const disabledRef = useRefWithValue(submitting)

	return useCallback(() => {
		// Check if we're enabled. (This is not the case if we're still submitting.)
		if (disabledRef.current)
			return
		
		// Check if the input has validated.
		if (!isValid())
			return

		// Check if the input is the same as for the previous action.
		const input = getCleanInput()
		const lastAction = (historyRef.current.length > 0 && lastOf(historyRef.current).action)
		if (lastAction && lastAction.type === 'input' && deepEquals(input, lastAction.input))
			return

		// All checks are fine. Submit the input!
		return submitAction({ type: 'input', input })
	}, [getCleanInput, isValid, historyRef, disabledRef, submitAction])
}

export function useGiveUpAction() {
	const { submitting, submitAction } = useExerciseData()
	const disabledRef = useRefWithValue(submitting)

	return useCallback(() => {
		if (disabledRef.current)
			return
		return submitAction({ type: 'giveUp' })
	}, [disabledRef, submitAction])
}