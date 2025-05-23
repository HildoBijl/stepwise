import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { hasX, incorrectFraction, nonEquivalentExpression } = expressionChecks
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
				<Par><Translation>Rewrite the equation such that it does not have any fractions anymore.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={EquationInput.settings.withFractions} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor1, factor2, multiplied }) => {
			return <Par><Translation>We multiply all terms with both <M>{factor1}</M> and <M>{factor2}</M>. For the first term, <M>{factor2}</M> disappears from the denominator, and the remaining factor is multiplied by <M>{factor1}</M>. For the other two terms, it is <M>{factor1}</M> that disappears from the denominator, and the remaining factors are multiplied by <M>{factor2}</M>. The result is <BM>{multiplied}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Solve the resulting simplified equation for <M>{variables.x}</M>. Simplify your result as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expanded, shifted, pulledOut, bracketFactor, ans }) => {
			return <Par><Translation>The equation is linear, so we take the default plan of approach. First we expand all brackets to get <BM>{expanded}.</BM> We then move all terms with <M>{variables.x}</M> to one side and all terms without <M>{variables.x}</M> to the other side. That is, <M>{expanded.right.terms[0].abs()}</M> moves to the left and <M>{expanded.left.terms[3].abs()}</M> goes to the right. This gives <BM>{shifted}.</BM> Next, we pull <M>{variables.x}</M> out of brackets. This turns the above into <BM>{pulledOut}.</BM> Finally we divide both sides of the equation by <M>{bracketFactor}</M> to solve for <M>{variables.x}</M>. The result is <BM>{variables.x} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		multiplied: [originalEquation, hasFraction, incorrectEquation, correctEquation],
		ans: [hasX, incorrectFraction, nonEquivalentExpression],
	})
}
