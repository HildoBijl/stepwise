
import { useCallback } from 'react'

import { useRefWithValue } from '../../../../util/react'
import { useExerciseData } from '../../ExerciseContainer'
import { useFormData } from '../../form/Form'
import { removeCursors } from '../../form/inputs/Input'

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