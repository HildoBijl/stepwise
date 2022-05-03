import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem(state) {
	const solution = useSolution(state)

	return <>
		<Par>Vul een uitdrukking in. Bijvoorbeeld iets als <M>{solution.ans}</M>.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>x=</M>} label="Vul hier het resultaat in" size="l" />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { ans } = useSolution(state)
	return <Par>Dit is de demo opgave. Het goed antwoord is <M>{ans}.</M></Par>
}

function getFeedback(exerciseData) {
	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData)
}
