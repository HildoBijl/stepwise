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
				<Par><Translation>Apply the rule for adding/subtracting fractions to write the expression as a single fraction. Use brackets where needed.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="singleFraction" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, singleFraction }) => {
			return <Par><Translation>The two fractions have equal denominators. This means that, to add/subtract these fractions, we may directly add/substract the numerators, leaving the denominator as is. This results in <BM>{expression} = {singleFraction}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Expand all brackets in the numerator.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="bracketsExpanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ singleFraction, bracketsExpanded }) => {
			return <Par><Translation>Using the default rules of expanding brackets, we wind up with <BM>{singleFraction} = {bracketsExpanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Simplify the numerator as much as possible by merging similar terms together.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expression, bracketsExpanded, ans, ansCleaned, isFurtherSimplificationPossible }) => {
			return <Par><Translation>Merging all terms with <M>{variables.x}</M> together, as well as all terms with <M>{variables.x}^2</M>, we find <BM>{bracketsExpanded} = {ans}.</BM> The numerator here is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM><Check value={isFurtherSimplificationPossible}><Check.True>Optionally, this can still be simplified further, written as <BM>{expression} = {ansCleaned}.</BM></Check.True><Check.False>This cannot be simplified further.</Check.False></Check></Translation></Par>
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
