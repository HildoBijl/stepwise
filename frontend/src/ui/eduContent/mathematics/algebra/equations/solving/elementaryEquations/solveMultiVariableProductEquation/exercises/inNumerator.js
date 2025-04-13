import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { nonEquivalentSolution, equivalentExpression, hasFractionWithinFraction, unsimplifiedPowerMerging, unsimplifiedFractionNumbers, invertedFraction } = expressionChecks
const { originalEquation } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Solve this equation for <M>{variables.x}</M> and simplify the result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Move all factors on the side of <M>{variables.x}</M> to the other side, except <M>{variables.x}</M> itself.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="isolated" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, factor1, factor2, isolated }) => {
			return <Par><Translation>We move the factor <M>{factor1}</M> to the other side, where it turns into a multiplication. Similarly, we move the factor <M>{factor2}</M> to the other side, where it turns into a division. All together, we wind up with <BM>{isolated}.</BM> Note that <M>{x}</M> has been isolated.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Simplify the result for <M>{variables.x}</M> as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ canSimplifyFraction, x, ans }) => {
			return <Par><Translation>Merging repeated multiplications into squares<Check value={canSimplifyFraction}><Check.True>, as well as simplifying all the numbers,</Check.True><Check.False></Check.False></Check> turns the solution into <BM>{x} = {ans}.</BM> It is not possible to simplify this any further.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, equation } = useSolution()
			return <>
				<Par><Translation>Check the solution for <M>{variables.x}</M>: insert it into the original equation and simplify each side as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="checkLeft" prelabel={<M>{equation.left}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
						<ExpressionInput id="checkRight" prelabel={<M>{equation.right}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, ans, equationWithSolution, equationWithSolutionCleaned }) => {
			return <Translation>
				<Par>We can directly insert <M>{x} = {ans}</M> into the equation. This results in <BM>{equationWithSolution}.</BM> Simplifying the fraction within the fraction, as well as canceling fraction factors, reduces this to <BM>{equationWithSolutionCleaned}.</BM> Since both sides of the equation reduce to the same outcome, the solution is correct.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up an extra feedbackCheck to check that the two check-parameters are equal.
	const unbalancedEquation = (input, answer, solution, correct, { input: { checkLeft, checkRight }, translateCrossExercise }) => checkLeft && checkRight && !expressionComparisons.onlyOrderChanges(checkLeft, checkRight) && { correct: false, text: translateCrossExercise(<>The two sides of the equation should in the end be the same. This value is not equal to the other one.</>, 'unbalancedEquation') }

	// Assemble the feedback.
	return getFieldInputFeedback(exerciseData, {
		isolated: [originalEquation],
		ans: [invertedFraction, nonEquivalentSolution, hasFractionWithinFraction, unsimplifiedPowerMerging, unsimplifiedFractionNumbers, equivalentExpression],
		checkLeft: { feedbackChecks: [hasFractionWithinFraction, unsimplifiedPowerMerging, unsimplifiedFractionNumbers, unbalancedEquation], dependency: 'checkRight' },
		checkRight: { feedbackChecks: [hasFractionWithinFraction, unsimplifiedPowerMerging, unsimplifiedFractionNumbers, unbalancedEquation], dependency: 'checkLeft' },
	})
}
