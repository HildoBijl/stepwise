
import { useCallback } from 'react'

import { deepEquals } from 'step-wise/util/objects'
import { lastOf } from 'step-wise/util/arrays'

import { useRefWithValue } from '../../../../util/react'
import { useExerciseData } from '../../ExerciseContainer'
import { useFormData } from '../../../form/Form'
import { removeCursors } from '../../../form/inputs/Input'

export function useSubmitAction() {
	const { submitting, submitAction, history } = useExerciseData()
	const { input, isValid } = useFormData()

	const inputRef = useRefWithValue(input)
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
		const input = removeCursors(inputRef.current)
		const lastAction = (historyRef.current.length > 0 && lastOf(historyRef.current).action)
		if (lastAction && lastAction.type === 'input' && deepEquals(input, lastAction.input))
			return
		
		// All checks are fine. Submit the input!
		return submitAction({ type: 'input', input })
	}, [inputRef, historyRef, disabledRef, isValid, submitAction])
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