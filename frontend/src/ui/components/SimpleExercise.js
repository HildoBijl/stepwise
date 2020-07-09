// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect, useCallback } from 'react'

import { noop } from 'step-wise/util/functions'
import { lastOf } from 'step-wise/util/arrays'
import { useExerciseData } from './ExerciseContainer'
import Form, { useFormData } from './Form'
import FeedbackProvider, { useFeedback } from './FeedbackProvider'
import { HideInputSpace } from './InputSpace'
import { useRefWithValue } from '../../util/react'

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

// useGetFeedbackFunction is a hook that tries to find a feedback function defined somewhere, or it creates one itself.
function useGetFeedbackFunction(props) {
	const { shared } = useExerciseData()

	// Is there a feedback function in the front-end folder that's passed through the properties?
	if (props.getFeedback)
		return (state, input, progress) => props.getFeedback(state, input, progress, shared)

	// Is there a feedback function in the shared folder?
	if (shared.getFeedback)
		return shared.getFeedback

	// Is there a checkInput function in the shared folder that we can use to set up a default getFeedback function?
	if (shared.checkInput)
		return (state, input) => ({ all: shared.checkInput(state, input) })

	// No data is present...
	return noop
}
