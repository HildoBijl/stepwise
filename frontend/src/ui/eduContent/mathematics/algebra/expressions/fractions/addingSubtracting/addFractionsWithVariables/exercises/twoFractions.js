import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

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
				<Par><Translation>Expand all brackets in the numerators.</Translation></Par>
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
			return <Par><Translation>Adding up the two fractions using the default rule, and merging similar terms, gives <BM>{bracketsExpanded} = {ans}.</BM> The numerator here is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM><Check value={isFurtherSimplificationPossible}><Check.True>Optionally, this can still be simplified further, written as <BM>{expression} = {ansCleaned}.</BM></Check.True><Check.False>This cannot be simplified further.</Check.False></Check></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		singleFraction: [originalExpression, incorrectExpression, noFraction, hasFractionWithinFraction, correctExpression],
		bracketsExpanded: [originalExpression, incorrectExpression, noFraction, hasFractionWithinFraction, fractionNumeratorHasSumWithinProduct, correctExpression],
		ans: [originalExpression, incorrectExpression, noFraction, hasFractionWithinFraction, fractionNumeratorHasSumWithinProduct, hasSimilarTerms, correctExpression],
	})
}
