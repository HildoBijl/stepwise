import React from 'react'

import { objectsEqual } from 'step-wise/util/objects'
import { useExerciseData } from '../../ExerciseContainer'
import { useFormData } from '../../form/Form'
import { useFeedback } from '../../form/FeedbackProvider'
import Status from '../../form/Status'

export default function Step({ progress: stepProgress, step, Problem, Solution }) {
	const { state, history } = useExerciseData()
	const { input } = useFormData()
	const { feedback, prevInput } = useFeedback()

	// If this step has had a submission, or is still active, show the input space.
	const hasSubmissions = history.some((event, index) => (event.progress.step === step && index < history.length - 1 && history[index + 1].action.type === 'input'))
	const showInputSpace = !stepProgress.done || hasSubmissions

	return <Status done={stepProgress.done} solved={stepProgress.solved} showInputSpace={showInputSpace}>
		<h3>Step {step}</h3>
		<Problem {...state} />
		{hasSubmissions && feedback[step] !== undefined && (stepProgress.done || objectsEqual(input, prevInput)) ? <p>{feedback[step] ? 'Correct' : 'Wrong'}</p> : null}
		{stepProgress.done ? <>
			<h3>Solution {step}</h3>
			<Solution {...state} />
		</> : null}
	</Status>
}