import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

import { rightSideChanged } from './util'

const { hasX, hasFractionWithinFraction, incorrectFraction, hasPower, nonEquivalentExpression, equivalentExpression } = expressionChecks
const { originalEquation, correctEquation, incorrectEquation, hasFraction } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Solve it for <M>{variables.x}</M>. Simplify your result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Reduce the fraction of fractions into a single fraction. (Leave the rest of the equation unchanged.)</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="simplified" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { b } = state
			const { variables, equation, simplified } = useSolution()
			return <Par><Translation>The short-cut towards simplifying the fraction of fractions is multiplying the numerator and the denominator by <M>{variables.y}</M> and subsequently dividing them by <M>{variables.x}</M>. <Check value={b > 0}><Check.True>Through this,</Check.True><Check.False>Through this, and through the cancellation of minus signs,</Check.False></Check> the fraction reduces to <BM>{equation.left} = {equation.left.multiplyNumDen(variables.y.divide(variables.x))} = {simplified.left}.</BM> By inserting this into the equation, we can write it as <BM>{simplified}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Rewrite the equation such that it does not have any fractions anymore.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ simplified, multiplied }) => {
			return <Par><Translation>We multiply both sides of the equation by <M>{simplified.left.denominator}.</M> After canceling out factors, we remain with <BM>{multiplied}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Solve the resulting simplified equation for <M>{variables.x}</M>. Simplify your result as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, shifted, pulledOut, bracketFactor, ans }) => {
			return <Par><Translation>The equation is linear, so we take the default plan of approach. We move all terms with <M>{variables.x}</M> to one side and all terms without <M>{variables.x}</M> to the other side. In this case it's easier to bring <M>{variables.x}</M> to the right, such that <BM>{shifted}.</BM> Next, we pull <M>{variables.x}</M> out of brackets. This turns the above into <BM>{pulledOut}.</BM> Finally we divide both sides of the equation by <M>{bracketFactor}</M> to solve for <M>{variables.x}</M>. The result is <BM>{variables.x} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const simplifiedChecks = [
		rightSideChanged,
		(input, correct, solution, isCorrect) => hasFractionWithinFraction(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => hasPower(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => nonEquivalentExpression(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => equivalentExpression(input.left, correct.left, solution, isCorrect),
	]

	return getFieldInputFeedback(exerciseData, {
		simplified: simplifiedChecks,
		multiplied: [originalEquation, hasFraction, incorrectEquation, correctEquation],
		ans: [hasX, incorrectFraction, nonEquivalentExpression],
	})
}
