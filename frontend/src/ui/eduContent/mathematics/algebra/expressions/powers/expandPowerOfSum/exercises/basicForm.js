import React from 'react'

import { repeat, arraysToObject } from 'step-wise/util'

import { Translation, WordList } from 'i18n'
import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, IntegerInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, hasNumberSimplifications, hasSumWithinProduct, sumWithWrongTerms, hasProductWithinPowerBase, productWithWrongFactors, equivalentExpression, nonEquivalentExpression } = expressionChecks

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
			const { e, variables, t1, t2, terms } = useSolution()
			return <>
				<Par><Translation>Set up the terms that will appear in the final expansion. For this, take the two terms <M>{t1}</M> and <M>{t2}</M> from the original set of brackets, raise them to the right power, and multiply the outcomes with each other. Do this for all possible combinations of positive exponents that add up to <M>{e}</M> (the original exponent).</Translation></Par>
				<InputSpace>
					<Par>
						{terms.map((term, i) => <ExpressionInput key={i} id={`term${i}`} prelabel={<M>{term}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />)}
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ e, terms, termsSimplified }) => {
			return <Par><Translation>We set up all the terms and simplify them as much as possible. This gives <BMList>
				{terms.map((term, i) => <BMPart key={i}>{term} = {termsSimplified[i]}{i === e ? '.' : ','}</BMPart>)}
			</BMList> These are the terms that will appear in our final expansion.
			</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { e } = useSolution()
			return <>
				<Par><Translation>Use Pascal's triangle to look up the multiplication coefficients for each of the terms.</Translation></Par>
				<InputSpace>
					<Par>
						{repeat(e + 1, i => <IntegerInput key={i} id={`c${i}`} size="l" />)}
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ e, coefficients }) => {
			return <Par><Translation>By looking up row <M>{e}</M> in Pascal's triangle, we can find the coefficients <WordList words={coefficients.map(c => <M>{c}</M>)} />, respectively.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Multiply each term with its respective coefficient, add everything up and simplify the outcome.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, sum, ans }) => {
			return <Par><Translation>We take each of the terms, multiply them by their coefficient and add up all the results to obtain <BM>{expression} = {sum}.</BM> Simplifying the number products at every term gives the final result, <BM>{expression} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const termFeedbackChecks = [
		hasProductWithinPowerBase,
		hasNumberSimplifications,
		productWithWrongFactors,
		nonEquivalentExpression,
		equivalentExpression,
	]
	const coefficientFeedbackChecks = [
		// Just looking up an integer, no need for checks.
	]
	const ansFeedbackChecks = [
		originalExpression,
		hasSumWithinProduct,
		hasNumberSimplifications,
		sumWithWrongTerms,
		nonEquivalentExpression,
		equivalentExpression,
	]
	return getFieldInputFeedback(exerciseData, {
		...arraysToObject(exerciseData.solution.termsNames, repeat(exerciseData.state.e + 1, () => termFeedbackChecks)),
		...arraysToObject(exerciseData.solution.coefficientsNames, repeat(exerciseData.state.e + 1, () => coefficientFeedbackChecks)),
		ans: ansFeedbackChecks
	})
}
