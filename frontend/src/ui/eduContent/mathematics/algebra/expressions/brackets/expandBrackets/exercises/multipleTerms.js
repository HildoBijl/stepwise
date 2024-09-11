import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, sumWithWrongTerms, hasSumWithinProduct, equivalentExpression, nonEquivalentExpression } = expressionChecks

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
				<Par><Translation>Take the factor outside of the bracket (here <M>{factor}</M>) and multiply it separately with each of the terms within the brackets (<M>{sum.terms[0]}</M>, <M>{sum.terms[1]}</M> and <M>{sum.terms[2]}</M>).</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="expanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, expanded }) => {
			return <Par><Translation>If we set up the two multiplications, keeping any pluses/minuses in-between, we wind up with <BM>{expression} = {expanded}.</BM></Translation></Par>
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
			return <Par><Translation>All three terms have a multiplication of two numbers. We can simplify all of them. This gives us <BM>{expanded} = {numbersMerged}.</BM></Translation></Par>
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
		Solution: ({ expression, variables, numbersMerged, ans }) => {
			return <Par><Translation>We can turn the multiplication of <M>{variables.x}</M> with itself into <M>{variables.x}^2</M>, and the multiplication of <M>{variables.x}</M> with <M>{variables.x}^2</M> becomes <M>{variables.x}^3</M>. This turns the full expression into <BM>{numbersMerged} = {ans}.</BM> This is our final answer. In short, <M>{expression} = {ans}</M>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		hasSumWithinProduct,
		sumWithWrongTerms,
		nonEquivalentExpression,
		equivalentExpression,
	]
	return getFieldInputFeedback(exerciseData, { expanded: feedbackChecks, numbersMerged: feedbackChecks, ans: feedbackChecks })
}
