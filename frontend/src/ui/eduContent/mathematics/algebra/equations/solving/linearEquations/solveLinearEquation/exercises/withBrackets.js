import React from 'react'

import { Integer, expressionComparisons } from 'step-wise/CAS'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { incorrectSolution, correctExpression, hasFractionWithinFraction, unsimplifiedFractionNumbers } = expressionChecks
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
		Solution: ({ variables, isolated }) => {
			return <Par><Translation>We move the factor <M>{variables.a}</M> to the other side, where it turns into a division.<Check value={Integer.one.equals(variables.b)}><Check.False> We also move the factor <M>{variables.b}</M> to the other side, where it becomes a multiplication.</Check.False></Check> All together, we wind up with <BM>{isolated}.</BM> Note that <M>{variables.x}</M> has been isolated.</Translation></Par>
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
		Solution: ({ variables, isolatedSolutionSimplified, fractionGcd, canSimplifyFraction, ans }) => {
			return <Par><Translation>First we write the fraction as a division between numbers, which is <BM>{variables.x} = {canSimplifyFraction ? isolatedSolutionSimplified : ans}.</BM> <Check value={canSimplifyFraction}><Check.True>We then simplify this fraction by canceling a factor <M>{fractionGcd}</M> in both the numerator and the denominator. This results in the final solution, <BM>{variables.x} = {ans}.</BM> It is not possible to simplify this any further.</Check.True><Check.False>No further factors can be canceled from this fraction: it is already as simplified as possible.</Check.False></Check></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, equation } = useSolution()
			return <>
				<Par><Translation>Check the solution for <M>{variables.x}</M>: insert it into the original equation and simplify each side as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="checkLeft" prelabel={<M>{equation.left}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.numeric} />
						<ExpressionInput id="checkRight" prelabel={<M>{equation.right}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ switchSides, variables, equation, ans, equationWithSolution, checkLeft, checkRight, canNumberSideBeSimplified }) => {
			return <Translation>
				<Par><Check value={switchSides}><Check.True>The left side of the original equation is already a number without <M>{variables.x}</M>, so no substitution is necessary. <Check value={canNumberSideBeSimplified}><Check.True>It can still be simplified into <BM>{equation.left} = {checkLeft}.</BM></Check.True><Check.False>It also cannot be simplified, so it remains as is, being <M>{checkLeft}</M>.</Check.False></Check></Check.True><Check.False>Substituting <M>{variables.x} = {ans}</M> into the left side of the original equation gives us <BM>{equation.left} = {equationWithSolution.left}.</BM> Simplifying the resulting fraction turns it into <BM>{equationWithSolution.left} = {checkLeft}.</BM></Check.False></Check></Par>
				<Par><Check value={!switchSides}><Check.True>The right side of the original equation is already a number without <M>{variables.x}</M>, so no substitution is necessary. <Check value={canNumberSideBeSimplified}><Check.True>It can still be simplified into <BM>{equation.right} = {checkRight}.</BM></Check.True><Check.False>It also cannot be simplified, so it remains as is, being <M>{checkRight}</M>.</Check.False></Check></Check.True><Check.False>Substituting <M>{variables.x} = {ans}</M> into the right side of the original equation gives us <BM>{equation.right} = {equationWithSolution.right}.</BM> Simplifying the resulting fraction turns it into <BM>{equationWithSolution.right} = {checkRight}.</BM></Check.False></Check></Par>
				<Par>Both sides of the equation reduce to the same number, which means that the solution is correct.</Par>
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
		ans: [incorrectSolution, hasFractionWithinFraction, unsimplifiedFractionNumbers, correctExpression],
		checkLeft: { feedbackChecks: [hasFractionWithinFraction, unsimplifiedFractionNumbers, unbalancedEquation], dependency: 'checkRight' },
		checkRight: { feedbackChecks: [hasFractionWithinFraction, unsimplifiedFractionNumbers, unbalancedEquation], dependency: 'checkLeft' },
	})
}
