import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

import { termsLeft, wrongSignUsed } from './util'

const { originalEquation, sumWithUnsimplifiedTerms } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { equation, toLeft } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Move all terms to the <Check value={toLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side. Simplify the result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { equation, termsToMove } = useSolution()
			return <>
				<Par><Translation><Check value={termsToMove[0].isNegative()}><Check.True>Add the term <M>{termsToMove[0].abs()}</M> to</Check.True><Check.False>Subtract the term <M>{termsToMove[0].abs()}</M> from</Check.False></Check> both sides of the equation. Then also <Check value={termsToMove[1].isNegative()}><Check.True>add the term <M>{termsToMove[1].abs()}</M> to</Check.True><Check.False>subtract the term <M>{termsToMove[1].abs()}</M> from</Check.False></Check> both sides of the equation.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="bothSidesChanged" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ bothSidesChanged }) => {
			return <Par><Translation>Doing as requested turns the equation into <BM>{bothSidesChanged}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { toLeft, equation } = useSolution()
			return <>
				<Par><Translation>Simplify the expression on the <Check value={toLeft}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side by canceling sum terms where possible.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ toLeft, ans }) => {
			return <Par><Translation>By canceling terms, we see that everything on the <Check value={toLeft}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side of the equation reduces to zero. We are left with <BM>{ans}.</BM> Note that all terms have indeed been moved to the <Check value={toLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check>. The <Check value={toLeft}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side has nothing (zero) left.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		bothSidesChanged: [originalEquation],
		ans: [originalEquation, termsLeft, wrongSignUsed, sumWithUnsimplifiedTerms],
	})
}
