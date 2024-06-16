import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, sumWithWrongTerms, hasSumWithinProduct, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Expand the brackets and simplify the result as much as possible.</Translation></Par>
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
			const { variables, sum, factor, expression } = useSolution()
			return <>
				<Par><Translation>Take the factor outside of the bracket (here <M>{factor}</M>) and multiply it separately with each of the terms within the brackets (<M>{sum.terms[0]}</M> and <M>{sum.terms[1]}</M>).</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="expanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, expanded, c }) => {
			return <Par><Translation>If we set up the two multiplications, keeping the minus in-between, we wind up with <BM>{expression} = {expanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Where possible, inside each term, merge products of numbers together into a single factor.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="numbersMerged" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expanded, numbersMerged }) => {
			return <Par><Translation>Both terms have a multiplication of two numbers. We can simplify both of them. Note that a multiplication of two negative numbers results in a positive number. This gives us <BM>{expanded} = {numbersMerged}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Where possible, inside each term, merge products of equal factors into a power.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, variables, n, numbersMerged, ans }) => {
			return <Par><Translation>We can turn the multiplication of <M>{variables.x}</M> with <M>{variables.x.toPower(n).removeUseless()}</M> into <M>{variables.x.toPower(n + 1)}</M>. This turns the full expression into <BM>{numbersMerged} = {ans}.</BM> This is our final answer. In short, <M>{expression} = {ans}</M>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		hasSumWithinProduct,
		sumWithWrongTerms,
		incorrectExpression,
		correctExpression,
	]
	return getFieldInputFeedback(exerciseData, { expanded: feedbackChecks, numbersMerged: feedbackChecks, ans: feedbackChecks })
}
