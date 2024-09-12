import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { nonEquivalentSolution, equivalentExpression, hasFractionWithinFraction, unsimplifiedFractionNumbers, invertedFraction } = expressionChecks
const { originalEquation, hasXInDenominator, fullEquationFeedback } = equationChecks

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
			const { equation, variables } = useSolution()
			return <>
				<Par><Translation>Move both the factor <M>{equation.left.denominator}</M> and the factor <M>{equation.right.denominator}</M> to the other side to ensure there is no <M>{variables.x}</M> in any denominator anymore.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="factorMoved" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ equation, factorMoved }) => {
			return <Par><Translation>The factor <M>{equation.left.denominator}</M> appears on the right as a multiplication, and similarly the factor <M>{equation.right.denominator}</M> appears on the left as a multiplication. This turns the equation into <BM>{factorMoved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Solve the resulting equation for <M>{variables.x}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expanded, termMoved, cleaned, factor, solution, canCleanSolution, ans, equationInserted, sideValue }) => {
			return <Translation>
				<Par>As usual when solving a linear equation, we first expand brackets. This turns the equation into <BM>{expanded}.</BM> Moving everything with <M>{variables.x}</M> to the left and everything without <M>{variables.x}</M> to the right gives <BM>{termMoved}.</BM> Merging terms to clean up the equation reduces it to <BM>{cleaned}.</BM><Check value={factor.number !== 1}><Check.True>Dividing by <M>{factor}</M> gives us the solution <BM>{variables.x} = {solution}.</BM><Check value={canCleanSolution}><Check.True>This can still be simplified into <BM>{variables.x} = {ans}.</BM></Check.True><Check.False>This cannot be simplified further.</Check.False></Check></Check.True><Check.False>Coincidentally the factor before the <M>{variables.x}</M> has already dropped out, so we have already found the solution, <BM>{variables.x} = {ans}.</BM></Check.False></Check></Par>
				<Par>The last thing to do is to check the solution. Inserting it into the original equation gives <BM>{equationInserted}.</BM> Both sides reduce to <M>{sideValue}</M> which shows that the solution is correct.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up the default feedback function for the factorMoved field.
	const factorMovedCheck = (input, correct, solution, isCorrect) => fullEquationFeedback(input, correct, solution, isCorrect, exerciseData.metaData.factorMovedComparison)

	return getFieldInputFeedback(exerciseData, {
		factorMoved: [originalEquation, hasXInDenominator, factorMovedCheck],
		ans: [invertedFraction, nonEquivalentSolution, hasFractionWithinFraction, unsimplifiedFractionNumbers, equivalentExpression],
	})
}

