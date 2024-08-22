import React from 'react'

import { Sum, Fraction, expressionComparisons } from 'step-wise/CAS'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { originalExpression, correctExpression, incorrectExpression, hasSimilarTerms, noFraction, hasFractionWithinFraction, fractionNumeratorHasSumWithinProduct } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Write this as a single fraction and simplify the numerator as much as possible.</Translation></Par>
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
				<Par><Translation>Rewrite both fractions to ensure that they have the same denominator.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="sameDenominator" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, fractions, sameDenominator }) => {
			return <Par><Translation>The first fraction is multiplied above and below by the denominator of the second fraction, being <M>{fractions[1].denominator}</M>. The second fraction is multiplied above and below by the denominator of the first fraction, being <M>{fractions[0].denominator}</M>. This results in <BM>{expression} = {sameDenominator}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Simplify all numerators as much as possible, including expanding brackets.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="bracketsExpanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ sameDenominator, bracketsExpanded }) => {
			return <Par><Translation>Using the default rules of expanding brackets, we wind up with <BM>{sameDenominator} = {bracketsExpanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Add up the two like fractions and simplify the numerator as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }) => {
			return <Par><Translation>Adding up the two fractions using the default rule, and merging similar terms, gives <BM>{bracketsExpanded} = {ans}.</BM> The numerator here is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM><Check value={isFurtherSimplificationPossible}><Check.True>Optionally, this can still be simplified further, written as <BM>{expression} = {ansCleaned}.</BM></Check.True></Check></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up additional checks for the specific requirements.
	const notTwoFractions = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !(input.isSubtype(Sum) && input.terms.length === 2 && input.terms.every(term => term.find(part => part.isSubtype(Fraction)))) && translateCrossExercise(<>We are expecting a sum of two fractions. Only rewrite the fractions and don't merge them together yet.</>, 'notTwoFractions')

	const unequalDenominators = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !equivalent(...input.terms.map(term => term.find(part => part.isSubtype(Fraction)).denominator)) && translateCrossExercise(<>The two fractions do not have the same denominator.</>, 'unequalDenominators')

	const unsimplifiedNumerator = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && !input.terms.every(term => {
		const numerator = term.find(part => part.isSubtype(Fraction)).numerator
		return onlyOrderChanges(numerator.elementaryClean(), numerator.basicClean({ expandProductsOfSums: true, groupSumTerms: true }))
	}) && translateCrossExercise(<>You can still further simplify the numerators.</>, 'unsimplifiedNumerator')

	// Merge all checks in the right order.
	return getFieldInputFeedback(exerciseData, {
		sameDenominator: [originalExpression, incorrectExpression, notTwoFractions, unequalDenominators, correctExpression],
		bracketsExpanded: [originalExpression, incorrectExpression, notTwoFractions, unequalDenominators, unsimplifiedNumerator, correctExpression],
		ans: [originalExpression, incorrectExpression, noFraction, hasFractionWithinFraction, fractionNumeratorHasSumWithinProduct, hasSimilarTerms, correctExpression],
	})
}
