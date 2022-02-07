
import { useCallback } from 'react'

import { lastOf } from 'step-wise/util/arrays'

import { useRefWithValue } from 'util/react'
import { useFormData } from 'ui/form/Form'

import { useExerciseData } from '../ExerciseContainer'

export function useSubmitAction() {
	const { submitting, submitAction, history } = useExerciseData()
	const { getInputSI, isValid, getFieldFunction } = useFormData()

	const historyRef = useRefWithValue(history)
	const disabledRef = useRefWithValue(submitting)

	return useCallback(() => {
		// Check if we're enabled. (This is not the case if we're still submitting.)
		if (disabledRef.current)
			return

		// Check if the input has validated.
		if (!isValid())
			return

		// Check if the input is the same as for the previous action. If so, do not do anything.
		const input = getInputSI()
		const lastAction = (historyRef.current.length > 0 && lastOf(historyRef.current).action)
		if (lastAction && lastAction.type === 'input') {
			const fieldIds = Object.keys(input)
			if (fieldIds.length === Object.keys(lastAction.input).length && fieldIds.every(id => getFieldFunction(id, 'equals')(input[id], lastAction.input[id])))
				return
		}

		// All checks are fine. Submit the input!
		return submitAction({ type: 'input', input })
	}, [getInputSI, isValid, historyRef, disabledRef, getFieldFunction, submitAction])
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