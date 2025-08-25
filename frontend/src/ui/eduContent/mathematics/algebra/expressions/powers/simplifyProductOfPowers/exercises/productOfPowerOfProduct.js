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
				<Par><Translation>Expand the outer brackets by pulling the power into the brackets. Use new brackets where needed.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="bracketsExpanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, bracketsExpanded }) => {
			return <Par><Translation>When we pull the exponent into the brackets (rule 2) we must apply them to every factor separately. This results in <BM>{expression} = {bracketsExpanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Simplify all products and powers of numbers.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="numbersSimplified" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ bracketsExpanded, numbersSimplified }) => {
			return <Par><Translation>The numbers in the expression are <M>{bracketsExpanded.terms[0]}</M> and <M>{bracketsExpanded.terms[2]}</M>. Their product equals <M>{numbersSimplified.terms[0]}</M> which turns the expression into <BM>{bracketsExpanded} = {numbersSimplified}.</BM></Translation></Par>
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
			Solution: ({ expression, powersMerged, ans }) => {
				return <Par><Translation>The two powers have the same base, so we may merge them together. When we do, we have to add up the exponents (rule 1). This turns the expression into <M>{powersMerged}</M>, which can be simplified further to the final result, <BM>{expression} = {ans}.</BM></Translation></Par>
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
	return getFieldInputFeedback(exerciseData, { bracketsExpanded: feedbackChecks, numbersSimplified: feedbackChecks, ans: feedbackChecks })
}
