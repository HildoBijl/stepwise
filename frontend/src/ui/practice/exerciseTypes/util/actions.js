
import { useCallback } from 'react'

import { applyToEachParameter } from 'step-wise/util/objects'
import { useRefWithValue } from '../../../../util/react'
import { useExerciseData } from '../../ExerciseContainer'
import { useFormData } from '../../form/Form'

export function useSubmitAction() {
	const { submitting, submitAction } = useExerciseData()
	const { input, isValid } = useFormData()

	const inputRef = useRefWithValue(input)
	const disabledRef = useRefWithValue(submitting)

	return useCallback(() => {
		if (disabledRef.current)
			return
		if (!isValid())
			return
		return submitAction({ type: 'input', input: removeCursors(inputRef.current) })
	}, [disabledRef, inputRef, isValid, submitAction])
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

function removeCursors(inputSet) {
	return applyToEachParameter(inputSet, input => {
		const result = { ...input } // Make a shallow copy of the object.
		delete result.cursor // Remove a potential cursor.
		return result
	})
}