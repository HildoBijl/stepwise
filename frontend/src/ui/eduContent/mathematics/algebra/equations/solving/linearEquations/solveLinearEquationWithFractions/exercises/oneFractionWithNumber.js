import React from 'react'

import { M, BM } from '@step-wise/math-display'
import { Translation, Condition } from '@step-wise/i18n'

import { Par } from 'ui/components'
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
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.numericWithFractions} validate={ExpressionInput.validation.numeric} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Before starting, simplify the equation a bit by bringing the <M>{variables.c.stripSigns()}</M> to the other side and merging numbers together.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="termMoved" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, switchSides, termMoved }) => {
			return <Par><Translation>By bringing the <M>{variables.c.stripSigns()}</M> to the <Condition value={switchSides}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> and <Condition value={variables.c.number > 0}><Condition.True>subtracting it from</Condition.True><Condition.False>adding it to</Condition.False></Condition> the <M>{variables.d}</M>, we get <BM>{termMoved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { termMoved, switchSides, variables } = useSolution()
			return <>
				<Par><Translation>Move the factor <M>{termMoved[switchSides ? 'right' : 'left'].denominator}</M> to the other side to ensure there is no <M>{variables.x}</M> in any denominator anymore.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="factorMoved" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ termMoved, switchSides, factorMoved }) => {
			return <Par><Translation>The factor <M>{termMoved[switchSides ? 'right' : 'left'].denominator}</M> appears on the <Condition value={switchSides}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> as a multiplication. This turns the equation into <BM>{factorMoved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Solve the resulting equation for <M>{variables.x}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.numericWithFractions} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, switchSides, expanded, cleaned, factor, solution, canCleanSolution, ans, equationInserted, sideValue }) => {
			return <Translation>
				<Par>As usual when solving a linear equation, we first expand brackets. This turns the equation into <BM>{expanded}.</BM> The only term with <M>{variables.x}</M> is already on the <Condition value={switchSides}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> so we can keep it there. Moving all numbers to the <Condition value={switchSides}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> and pulling them together results in <BM>{cleaned}.</BM><Condition value={factor.number !== 1}><Condition.True>Dividing by <M>{factor}</M> gives us the solution <BM>{variables.x} = {solution}.</BM><Condition value={canCleanSolution}><Condition.True>This can still be simplified into <BM>{variables.x} = {ans}.</BM></Condition.True><Condition.False>This cannot be simplified further.</Condition.False></Condition></Condition.True><Condition.False>Coincidentally the factor before the <M>{variables.x}</M> has already dropped out, so we have already found the solution, <BM>{variables.x} = {ans}.</BM></Condition.False></Condition></Par>
				<Par>The last thing to do is to check the solution. Inserting it into the original equation gives <BM>{equationInserted}.</BM> Both sides reduce to <M>{sideValue}</M> which shows that the solution is correct.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up the default feedback function for the factorMoved field.
	const factorMovedCheck = (input, correct, solution, isCorrect) => fullEquationFeedback(input, correct, solution, isCorrect, exerciseData.metadata.factorMovedComparison)

	return getFieldInputFeedback(exerciseData, {
		termMoved: [originalEquation],
		factorMoved: [originalEquation, hasXInDenominator, factorMovedCheck],
		ans: [invertedFraction, nonEquivalentSolution, hasFractionWithinFraction, unsimplifiedFractionNumbers, equivalentExpression],
	})
}
