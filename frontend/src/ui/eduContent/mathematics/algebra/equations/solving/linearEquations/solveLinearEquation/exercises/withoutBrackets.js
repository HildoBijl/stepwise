import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { nonEquivalentSolution, equivalentExpression, hasFractionWithinFraction, unsimplifiedFractionNumbers, invertedFraction } = expressionChecks
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
				<Par><Translation>Move all terms containing <M>{variables.x}</M> to one side, and all terms without <M>{variables.x}</M> to the other side.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="moved" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, moved }) => {
			return <Par><Translation>If we move all terms with <M>{variables.x}</M> to the left and all terms without <M>{variables.x}</M> to the right, then we get <BM>{moved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Clean up both equation sides separately by merging terms together.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="cleaned" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, cleaned }) => {
			return <Par><Translation>On the left we merge terms with <M>{variables.x}</M> together, and on the right we simply add together the numbers. This results in <BM>{cleaned}.</BM></Translation></Par>
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
		Solution: ({ variables, factor, solution, canCleanSolution, ans, equationInserted, sideValue }) => {
			return <Translation>
				<Par><Check value={factor.number !== 1}><Check.True>As usual when solving a product equation, we move the factor in front of <M>{variables.x}</M> (here <M>{factor}</M>) to the other side, where it will be divided by. This gives the solution <BM>{variables.x} = {solution}.</BM><Check value={canCleanSolution}><Check.True>This can still be simplified into <BM>{variables.x} = {ans}.</BM></Check.True><Check.False>This cannot be simplified further.</Check.False></Check></Check.True><Check.False>Coincidentally the factor before the <M>{variables.x}</M> has already dropped out. As a result, we have already found the solution, <BM>{variables.x} = {ans}.</BM></Check.False></Check></Par>
				<Par>The last thing to do is to check the solution. Inserting it into the original equation gives <BM>{equationInserted}.</BM> Both sides reduce to <M>{sideValue}</M> which shows that the solution is correct.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		moved: [originalEquation],
		cleaned: [originalEquation],
		ans: [invertedFraction, nonEquivalentSolution, hasFractionWithinFraction, unsimplifiedFractionNumbers, equivalentExpression],
	})
}
