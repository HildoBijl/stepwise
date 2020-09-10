// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect } from 'react'

import { inputSetsEqual } from 'step-wise/inputTypes'

import VerticalAdjuster from '../../../../util/reactComponents/VerticalAdjuster'
import { useFormData } from '../../../form/Form'
import { useFeedback } from '../../../form/FeedbackProvider'
import Status from '../../../form/Status'
import { useFieldControllerContext } from '../../../form/FieldController'

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
	const { input } = useFormData()
	const { feedbackInput } = useFeedback()
	const { focusFirst } = useFieldControllerContext()

	// Upon loading, or on history updates, focus on the first field.
	useEffect(() => {
		if (!progress.done)
			focusFirst()
	}, [Problem, progress, history, focusFirst])

	// Determine what to show.
	const hasSubmissions = history.some(event => event.action.type === 'input') // Has there been an input action?
	const showInputSpace = !progress.done || hasSubmissions
	const showMainFeedback = showInputSpace && (progress.done || inputSetsEqual(input, feedbackInput))

	return <>
		<ProblemContainer>
			<Status showInputSpace={showInputSpace} done={progress.done}>
				<VerticalAdjuster>
					<Problem {...state} />
				</VerticalAdjuster>
			</Status>
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
