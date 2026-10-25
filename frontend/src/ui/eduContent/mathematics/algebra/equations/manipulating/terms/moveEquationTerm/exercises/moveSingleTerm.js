import React from 'react'

import { M, BM } from '@step-wise/math-display'
import { Translation, Condition } from '@step-wise/i18n'

import { Par, Emp } from 'ui/components'
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
				<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.collectVariables())} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { equation, positive, termToMove } = useSolution()
			return <>
				<Par><Translation><Condition value={positive}><Condition.True><Emp>Subtract</Emp> the term <M>{termToMove}</M> from</Condition.True><Condition.False><Emp>Add</Emp> the term <M>{termToMove}</M> to</Condition.False></Condition> both sides of the equation. (After all, the term <M>{termToMove}</M> is currently being <Condition value={positive}><Condition.True><Emp>added</Emp></Condition.True><Condition.False><Emp>subtracted</Emp></Condition.False></Condition>.)</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="bothSidesChanged" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.collectVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ positive, termToMove, bothSidesChanged }) => {
			return <Par><Translation>If we <Condition value={positive}><Condition.True>subtract</Condition.True><Condition.False>add</Condition.False></Condition> <M>{termToMove}</M> on both sides, then we directly wind up with <BM>{bothSidesChanged}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { switchSides, toMove, equation } = useSolution()
			return <>
				<Par><Translation>Simplify the expression on the <Condition value={switchSides[toMove]}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side by canceling sum terms where possible. Also apply any other potential simplifications.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.polynomes} validate={EquationInput.validation.validWithVariables(equation.collectVariables())} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ termToMove, ans, positive }) => {
			return <Par><Translation>Subsequently adding and subtracting <M>{termToMove}</M> has no effect, so these two terms can be canceled. We remain with <BM>{ans}.</BM> Note that <M>{termToMove}</M> has moved to the other side, and is now being <Condition value={positive}><Condition.True>subtracted</Condition.True><Condition.False>added</Condition.False></Condition>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		bothSidesChanged: [originalEquation],
		ans: [originalEquation, termsNotCanceled, wrongSignUsed, sumWithUnsimplifiedTerms],
	})
}
