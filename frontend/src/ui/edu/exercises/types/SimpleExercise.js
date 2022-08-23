// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect, useRef } from 'react'

import { deepEquals } from 'step-wise/util/objects'

import VerticalAdjuster from 'ui/components/layout/VerticalAdjuster'
import { useFormData } from 'ui/form/Form'
import { useFeedback } from 'ui/form/FeedbackProvider'
import FormPart from 'ui/form/FormPart'
import { useFieldControllerContext } from 'ui/form/FieldController'

import { useExerciseData } from '../ExerciseContainer'
import ExerciseWrapper from '../util/ExerciseWrapper'
import ProblemContainer from '../util/ProblemContainer'
import MainFeedback from '../util/MainFeedback'
import SolutionContainer from '../util/SolutionContainer'
import ExerciseButtons from '../util/ExerciseButtons'

export default function SimpleExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || simpleExerciseGetFeedback}>
			<Contents {...props} />
		</ExerciseWrapper>
	)
}

function Contents({ Problem, Solution }) {
	const { state, progress, history } = useExerciseData()
	const { getInputSI } = useFormData()
	const { feedbackInput } = useFeedback()
	const { activateFirst } = useFieldControllerContext()
	const timeoutIndexRef = useRef()

	// Upon loading, or on history updates, focus on the first field. (Delay to ensure all fields are registered.)
	useEffect(() => {
		clearTimeout(timeoutIndexRef.current)
		if (!progress.done)
			timeoutIndexRef.current = setTimeout(activateFirst)
	}, [Problem, progress, history, activateFirst])

	// Determine what to show.
	const hasSubmissions = history.some(event => event.action.type === 'input') // Has there been an input action?
	const showInputSpace = !progress.done || hasSubmissions
	const showMainFeedback = showInputSpace && (progress.done || deepEquals(getInputSI(), feedbackInput))

	return <>
		<ProblemContainer>
			<FormPart readOnly={progress.done} showInputSpace={showInputSpace} showHints={!progress.done}>
				<VerticalAdjuster>
					<Problem {...state} />
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} />
		</ProblemContainer>
		<SolutionContainer display={!!progress.done} initialExpand={!progress.solved}>
			<Solution {...state} />
		</SolutionContainer>
		<ExerciseButtons />
	</>
}

function simpleExerciseGetFeedback({ state, input, shared }) {
	if (!shared.checkInput)
		return {}
	return { main: shared.checkInput(state, input) }
}
