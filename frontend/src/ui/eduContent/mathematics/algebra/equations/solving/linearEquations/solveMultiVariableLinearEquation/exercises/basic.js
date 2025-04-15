import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

import { variableOnBothSides, termsWithoutVariableInWrongPlace, sumWithWrongTermsAndFlip, sideWithoutVariableEqual, sideWithVariableEqual } from './util'

const { hasX, incorrectFraction, nonEquivalentExpression } = expressionChecks
const { originalEquation, correctEquation, incorrectEquation } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Solve it for <M>{variables.x}</M>.</Translation></Par>
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
			const { x, variables } = useSolution()
			return <>
				<Par><Translation>Move all terms with <M>{x}</M> to one side of the equation, and all terms without <M>{x}</M> to the other side.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="termsMoved" size="l" settings={EquationInput.settings.withFractions} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ equation, termsMoved }) => {
			return <Par><Translation>We move <M>{equation.right.terms[0].abs()}</M> to the left and <M>{equation.left.terms[1].abs()}</M> to the right. This gives us <BM>{termsMoved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { x, variables } = useSolution()
			return <>
				<Par><Translation>Pull <M>{x}</M> outside of brackets. Leave the rest of the equation unchanged.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="pulledOut" size="l" settings={EquationInput.settings.withFractions} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, termsMoved, bracketTerm, pulledOut }) => {
			return <Par><Translation>To pull <M>{variables.x}</M> outside of brackets, we must write <M>{termsMoved.left}</M> as <M>{variables.x}\cdot\left(\ldots\right)</M>. This tells us that there should be <M>{bracketTerm}</M> between the brackets. In this way we can rewrite the equation as <BM>{pulledOut}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { x, variables } = useSolution()
			return <>
				<Par><Translation>Move the factor between brackets to the other side, to solve for <M>{x}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, bracketTerm, ans, equationWithSolution, equationWithSolutionMergedFractions, equationWithSolutionExpandedBrackets }) => {
			return <Translation>
				<Par>If we divide both sides by <M>{bracketTerm}</M>, then on the left the factor between brackets disappears. We only remain with <M>{variables.x}</M>, meaning that we have indeed solved the equation for <M>{variables.x}</M>! The final result is <BM>{variables.x} = {ans}.</BM> Of course this solution can also be written in other ways, but small variations in notation are not relevant here.</Par>
				<Par>A final recommended step is to check the solution. If we literally insert the solution into the original equation, we get <BM>{equationWithSolution}.</BM> We can write each side as one large fraction to get <BM>{equationWithSolutionMergedFractions}.</BM> Subsequently expanding brackets and canceling sum terms turns this into <BM>{equationWithSolutionExpandedBrackets}.</BM> Note that both sides have reduced to the same. This means that our solution is correct.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		ans: [hasX, incorrectFraction, nonEquivalentExpression],
		termsMoved: [originalEquation, variableOnBothSides, termsWithoutVariableInWrongPlace, sumWithWrongTermsAndFlip, incorrectEquation, correctEquation],
		pulledOut: [sideWithoutVariableEqual, sideWithVariableEqual, incorrectEquation, correctEquation],
	})
}
