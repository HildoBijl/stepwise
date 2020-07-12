// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect, useCallback } from 'react'

import { lastOf } from 'step-wise/util/arrays'
import { useExerciseData } from '../ExerciseContainer'
import Form, { useFormData } from '../form/Form'
import FeedbackProvider, { useFeedback } from '../form/FeedbackProvider'
import { HideInputSpace } from '../form/InputSpace'
import { useRefWithValue } from '../../../util/react'
import { useGetFeedbackFunction } from './util'

export default function SimpleExercise(props) {
	const getFeedback = useGetFeedbackFunction(props)
	return (
		<Form>
			<FeedbackProvider getFeedback={getFeedback}>
				<Contents Problem={props.Problem} Solution={props.Solution} />
			</FeedbackProvider>
		</Form>
	)
}

function Contents({ Problem, Solution }) {
	const { state, history, progress, submitting, submitAction, startNewExercise } = useExerciseData()
	const { input, isValid } = useFormData()
	const { prevInput, updateFeedback } = useFeedback()

	// Set up refs to track state parameters.
	const inputRef = useRefWithValue(input)
	const disabledRef = useRefWithValue(submitting) // Do we disable all actions?

	// After a submit action is fully processed, update potential feedback.
	useEffect(() => {
		const lastHistoryItem = lastOf(history)
		if (lastHistoryItem && lastHistoryItem.action && lastHistoryItem.action.type === 'input')
			updateFeedback(lastHistoryItem.action.input)
	}, [history, updateFeedback])

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

	// Determine what to show.
	const hideProblemInputSpace = progress.givenUp && !prevInput

	return <>
		{hideProblemInputSpace ? <HideInputSpace><Problem {...state} /></HideInputSpace> : <Problem {...state} />}
		{
			!progress.done ? (
				<p>
					<button type="button" onClick={submit} disabled={disabledRef.current}>Submit</button>
					<button type="button" onClick={giveUp} disabled={disabledRef.current}>Give up</button>
				</p>
			) : (
					<>
						<Solution {...state} />
						<p><button type="button" onClick={startNewExercise}>Next problem</button></p>
					</>
				)
		}
	</>
}
