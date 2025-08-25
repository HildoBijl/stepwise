import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, hasProductWithinPowerBase, productWithWrongFactors, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Expand brackets and merge powers to simplify the result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Turn the power of a power into a single power.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="powersReduced" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, powersReducedStep, powersReduced }) => {
			return <Par><Translation>We can pull the outer power in <M>{expression.terms[2]}</M> into the exponent, where it becomes a multiplication <M>{powersReducedStep.terms[2]}</M> (rule 3), which in turn becomes <M>{powersReduced.terms[2]}</M>. So we may write <BM>{expression} = {powersReduced}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Merge the product of the powers into a single power and simplify the resulting exponent.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, powersMergedStep, ans }) => {
			return <Par><Translation>The two powers have the same base, so we may merge them together. When we do, we have to add up the exponents (rule 1). This turns the expression into <M>{powersMergedStep}</M>, which can be simplified further to the final result, <BM>{expression} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		hasProductWithinPowerBase,
		productWithWrongFactors,
		nonEquivalentExpression,
		equivalentExpression,
	]
	return getFieldInputFeedback(exerciseData, { powersReduced: feedbackChecks, ans: feedbackChecks })
}
