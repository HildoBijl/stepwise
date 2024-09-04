import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM, Emp } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

import { termsNotCanceled, wrongSignUsed } from './util'

const { originalEquation, sumWithUnsimplifiedTerms } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { equation, termToMove } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Move the term <M>{termToMove}</M> to the other side. Simplify the result as much as possible.</Translation></Par>
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
			const { equation, positive, termToMove } = useSolution()
			return <>
				<Par><Translation><Check value={positive}><Check.True><Emp>Subtract</Emp> the term <M>{termToMove}</M> from</Check.True><Check.False><Emp>Add</Emp> the term <M>{termToMove}</M> to</Check.False></Check> both sides of the equation. (After all, the term <M>{termToMove}</M> is currently being <Check value={positive}><Check.True><Emp>added</Emp></Check.True><Check.False><Emp>subtracted</Emp></Check.False></Check>.)</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="bothSidesChanged" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ positive, termToMove, bothSidesChanged }) => {
			return <Par><Translation>If we <Check value={positive}><Check.True>subtract</Check.True><Check.False>add</Check.False></Check> <M>{termToMove}</M> on both sides, then we directly wind up with <BM>{bothSidesChanged}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { switchSides, toMove, equation } = useSolution()
			return <>
				<Par><Translation>Simplify the expression on the <Check value={switchSides[toMove]}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side by canceling sum terms where possible. Also apply any other potential simplifications.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.getVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ termToMove, ans, positive }) => {
			return <Par><Translation>Subsequently adding and subtracting <M>{termToMove}</M> has no effect, so these two terms can be canceled. We remain with <BM>{ans}.</BM> Note that <M>{termToMove}</M> has moved to the other side, and is now being <Check value={positive}><Check.True>subtracted</Check.True><Check.False>added</Check.False></Check>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		bothSidesChanged: [originalEquation],
		ans: [originalEquation, termsNotCanceled, wrongSignUsed, sumWithUnsimplifiedTerms],
	})
}
