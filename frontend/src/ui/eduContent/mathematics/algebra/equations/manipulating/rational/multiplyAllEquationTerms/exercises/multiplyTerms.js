import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, sumWithWrongTerms, hasSumWithinProduct, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { equation, factor, variables } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Multiply all terms by <M>{factor}</M> and simplify each resulting term as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, factor } = useSolution()
			return <>
				<Par><Translation>Multiply both sides of the equation by <M>{factor}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="form" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, form }) => {
			return <Par><Translation>When we multiply each side of the equation by <M>{factor}</M> it is important to use brackets. Doing so results in <BM>{form}.</BM> Note that it does not matter if we put the multiplication on the left or on the right: this comes down to the same.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Expand all the brackets that are present.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expanded }) => {
			return <Par><Translation>To expand the brackets, we multiply each of the terms within brackets separately by the factor outside of the brackets. When doing so, we may pull this multiplying factor into the numerator (above) as well. This results in <BM>{expanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Simplify each of the resulting terms as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, ans, factor }) => {
			return <Par><Translation>Crossing out factors of <M>{variables.x}</M> and merging number products where relevant, we end up with <BM>{ans}.</BM> Note that every term has been multiplied individually by the factor <M>{factor}</M>.</Translation></Par>
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
