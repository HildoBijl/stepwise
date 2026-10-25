import React from 'react'

import { M, BM } from '@step-wise/math-display'
import { Translation, Condition } from '@step-wise/i18n'

import { Par } from 'ui/components'
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
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Move all terms to the <Condition value={toLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side. Simplify the result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.collectVariables())} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { equation, termsToMove } = useSolution()
			return <>
				<Par><Translation><Condition value={termsToMove[0].isMinus()}><Condition.True>Add the term <M>{termsToMove[0].stripSigns()}</M> to</Condition.True><Condition.False>Subtract the term <M>{termsToMove[0].stripSigns()}</M> from</Condition.False></Condition> both sides of the equation. Then also <Condition value={termsToMove[1].isMinus()}><Condition.True>add the term <M>{termsToMove[1].stripSigns()}</M> to</Condition.True><Condition.False>subtract the term <M>{termsToMove[1].stripSigns()}</M> from</Condition.False></Condition> both sides of the equation.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="bothSidesChanged" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.collectVariables())} />
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
				<Par><Translation>Simplify the expression on the <Condition value={toLeft}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side by canceling sum terms where possible.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.collectVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ toLeft, ans }) => {
			return <Par><Translation>By canceling terms, we see that everything on the <Condition value={toLeft}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side of the equation reduces to zero. We are left with <BM>{ans}.</BM> Note that all terms have indeed been moved to the <Condition value={toLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition>. The <Condition value={toLeft}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side has nothing (zero) left.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		bothSidesChanged: [originalEquation],
		ans: [originalEquation, termsLeft, wrongSignUsed, sumWithUnsimplifiedTerms],
	})
}
