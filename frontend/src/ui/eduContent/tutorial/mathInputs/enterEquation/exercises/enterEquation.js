import React from 'react'

import { equationComparisons } from 'step-wise/CAS'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ equation }) {
	return <Translation>
		<Par>Consider the equation <BM>{equation}.</BM> Make some basic modification to it, so that it's different yet still mathematically equivalent.</Par>
		<InputSpace>
			<Par><EquationInput id="ans" label="Enter the equation here" size="l" validate={EquationInput.validation.validWithVariables(equation.getVariables())} /></Par>
		</InputSpace>
	</Translation>
}

function Solution({ equation, ans }) {
	return <Translation><Par>There are many ways in which the equation <M>{equation}</M> can be adjusted. For instance, we can switch the left and the right side, resulting in <BM>{ans}.</BM> Of course there are infinitely many other valid solutions too.</Par></Translation>
}

function getFeedback(exerciseData) {
	const { translate } = exerciseData
	return getFieldInputFeedback(exerciseData, {
		ans: [
			(input, solution, _, correct) => !correct && equationComparisons.exactEqual(input, solution.switch()) && translate(<>You have entered the equation without making any modifications. You must rewrite the equation to something different.</>, 'exactlyEqual'),
			(input, solution, _, correct) => !correct && !equationComparisons.equivalent(input, solution.switch()) && translate(<>This is not equivalent to the original equation. You have done something to it that's mathematically not allowed, or that's too different for us to detect.</>, 'notEquivalent'),
		]
	})
}
