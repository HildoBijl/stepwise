import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM, Emp } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

const { originalEquation, onlyOrderChangesFeedback, equivalentFeedback } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { factor, equation } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Move the factor <M>{factor}</M> to the other side. (Make sure that there are no fractions of fractions in the final result.)</Translation></Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { factor, equation } = useSolution()
			return <>
				<Par><Translation><Emp>Multiply</Emp> both sides of the equation by <M>{factor}</M>. (After all, the factor <M>{factor}</M> is currently being <Emp>divided by</Emp>.)</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="bothSidesChanged" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ equation, factor, bothSidesChanged }) => {
			return <Par><Translation>If we multiply both sides of the equation <M>{equation}</M> by the factor <M>{factor}</M>, then we directly wind up with <BM>{bothSidesChanged}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { switchSides, equation } = useSolution()
			return <>
				<Par><Translation>Simplify the fraction on the <Check value={switchSides}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side by canceling fraction factors where possible.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, ans, switchSides }) => {
			return <Par><Translation>We can cancel out the factor <M>{factor}</M> on both sides of the fraction. This gives the result <BM>{ans}.</BM>This is the final result, with <M>{factor}</M> now on the <Check value={switchSides}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		bothSidesChanged: [originalEquation, equivalentFeedback],
		ans: [originalEquation, onlyOrderChangesFeedback],
	})
}
