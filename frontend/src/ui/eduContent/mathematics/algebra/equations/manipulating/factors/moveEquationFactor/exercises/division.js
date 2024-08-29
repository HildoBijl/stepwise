import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM, Emp } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

const { hasFractionWithinFraction, originalEquation, leftOnlyOrderChangesFeedback, rightOnlyOrderChangesFeedback, equivalentFeedback } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { factor, equation } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Move the factor <M>{factor}</M> to the other side. (Also make sure that there are no fractions of fractions in the final result.)</Translation></Par>
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
				<Par><Translation><Emp>Divide</Emp> both sides of the equation by <M>{factor}</M>. (After all, the factor <M>{factor}</M> is inside a <Emp>multiplication</Emp>.)</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="bothSidesChanged" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ equation, factor, bothSidesChanged }) => {
			return <Par><Translation>If we divide both sides of the equation <M>{equation}</M> by the factor <M>{factor}</M>, then we directly wind up with <BM>{bothSidesChanged}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { switchSides, equation } = useSolution()
			return <>
				<Par><Translation>Simplify the fraction on the <Check value={switchSides}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side by canceling fraction factors where possible.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="fractionFactorsCanceled" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, fractionFactorsCanceled }) => {
			return <Par><Translation>We can cancel out the factor <M>{factor}</M> on both sides of the fraction. This gives the result <BM>{fractionFactorsCanceled}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { switchSides, equation } = useSolution()
			return <>
				<Par><Translation>Also simplify the fraction on the <Check value={switchSides}><Check.True>left</Check.True><Check.False>right</Check.False></Check> (if not already done) to ensure that there is no fraction of fractions in the final result.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ ans, ansCleaned, isFurtherSimplificationPossible }) => {
			return <Par><Translation>Dividing a fraction by a factor will add that factor to the denominator. This gives the result <BM>{ans}.</BM><Check value={isFurtherSimplificationPossible}><Check.True>Optionally, this can still be simplified to <BM>{ansCleaned}.</BM></Check.True><Check.False>This cannot be simplified further.</Check.False></Check></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define an alternate feedback check for the final answer, to take into account allowed simplifications.
	const ansCheck = (input, correct, { switchSides }, isCorrect) => (switchSides ? rightOnlyOrderChangesFeedback : leftOnlyOrderChangesFeedback)(input, correct, {}, isCorrect)

	// Set up the overview of feedback checks.
	return getFieldInputFeedback(exerciseData, {
		bothSidesChanged: [originalEquation, equivalentFeedback],
		fractionFactorsCanceled: [originalEquation, ansCheck],
		ans: [originalEquation, hasFractionWithinFraction, ansCheck],
	})
}
