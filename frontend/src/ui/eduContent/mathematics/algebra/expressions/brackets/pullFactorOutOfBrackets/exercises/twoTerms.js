import React from 'react'

import { Sum, Product, Fraction, expressionComparisons } from 'step-wise/CAS'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { originalExpression, sumWithUnsimplifiedTerms, hasSumWithinProduct, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression, factor } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Pull a factor <M>{factor}</M> out of brackets and simplify the result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Write the expression in the standard starting form <M>\rm(Original\ expression) = \rm(Factor) \cdot \left(\frac(\rm(Original\ expression))(\rm(Factor))\right)</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="startingForm" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, factor }) => {
			return <Par><Translation>If we write the expression in the starting form for expanding brackets, we get <BM>{expression} = {factor} \cdot \left(\frac({expression})({factor})\right).</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Split the fraction up into separate fractions: one for each term. (Keep the multiplication around it as is.)</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="splitUp" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, factor, splitUp }) => {
			return <Par><Translation>To split up the fraction, we must divide each of the terms in the numerator separately by the denominator. This gives <BM>{factor} \cdot \left(\frac({expression})({factor})\right) = {splitUp}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Simplify each of the fractions within the brackets as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, splitUp, ans }) => {
			return <Par><Translation>By canceling factors within each fraction, we can turn all fractions into fractionless terms. The result is <BM>{splitUp} = {ans}.</BM> This is our final answer. In short, <M>{expression} = {ans}</M>.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, ans } = useSolution()
			return <>
				<Par><Translation>Check your result by expanding the brackets and simplifying the result. Verify that this is indeed the expression we started with.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="check" prelabel={<M>{ans}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, splitUp, ans }) => {
			return <Par><Translation>If we expand the brackets in our final result, we get <BM>{ans} = {expression}.</BM> This is indeed what we started with, so our solution is correct.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define general checks.
	const missingFactor = (input, correct, { factor }, isCorrect, { translateCrossExercise }) => !isCorrect && !(input.isSubtype(Product) && input.factors.length === 3 && factor.factors.every(subFactor => input.factors.some(inputFactor => onlyOrderChanges(inputFactor, subFactor)))) && translateCrossExercise(<>Your answer should be of the form <M>{factor} \cdot \left(\ldots\right)</M>.</>, 'missingFactor')

	// Define checks for the starting form.
	const incorrectFractionDenominator = (input, correct, { factor }, isCorrect, { translateCrossExercise }) => !isCorrect && !(input.isSubtype(Product) && input.factors.find(inputFactor => inputFactor.isSubtype(Fraction) && onlyOrderChanges(inputFactor.denominator, factor))) && translateCrossExercise(<>Your answer should be in the given starting form. Have you put the factor <M>{factor}</M> in the denominator of a fraction?</>, 'incorrectFractionDenominator')
	const incorrectFractionNumerator = (input, correct, { expression }, isCorrect, { translateCrossExercise }) => !isCorrect && !(input.isSubtype(Product) && input.factors.find(inputFactor => inputFactor.isSubtype(Fraction) && onlyOrderChanges(inputFactor.numerator, expression))) && translateCrossExercise(<>Your answer should be in the given starting form. Have you put the original expression <M>{expression}</M> in the numerator of a fraction?</>, 'incorrectFractionNumerator')

	// Define checks for the split form.
	const hasFractionBeenSplit = (input, correct, { expression }, isCorrect, { translateCrossExercise}) => !isCorrect && !(input.isSubtype(Product) && input.factors.find(inputFactor => inputFactor.isSubtype(Sum) && inputFactor.terms.length === expression.terms.length)) && translateCrossExercise(<>Have you split up the fraction into a summation?</>, 'hasFractionBeenSplit')

	return getFieldInputFeedback(exerciseData, {
		startingForm: [originalExpression, missingFactor, incorrectFractionDenominator, incorrectFractionNumerator, incorrectExpression, correctExpression],
		splitUp: [missingFactor, hasFractionBeenSplit, incorrectExpression, correctExpression],
		ans: [missingFactor, hasFractionBeenSplit, incorrectExpression, correctExpression],
		check: [hasSumWithinProduct, sumWithUnsimplifiedTerms, incorrectExpression, correctExpression],
	})
}
