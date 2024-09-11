import React from 'react'

import { Translation, CountingWord } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, equivalentExpression, nonEquivalentExpression, noFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the fraction <BM>{expression}.</BM> Simplify this fraction as much as possible. (Potential brackets do not have to be expanded.)</Translation></Par>
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
				<Par><Translation>Focus on the numeric factors first. Simplify these as much as possible, leaving the rest as is.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="numericSimplified" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, numericPartOriginal, numericPart, expression, numericSimplified }) => {
			return <Par><Translation>The numbers inside the fraction equal <M>{numericPartOriginal}</M>. We can divide both the numerator and the denominator by <M>{factor}</M>, which leaves us with <M>{numericPart}</M>. Writing this together with the (unchanged) variable factors, we get <BM>{expression} = {numericSimplified}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Cancel all possible variable factors, to further simplify the fraction.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ p, r, factor1, factor2, expression, numericSimplified, ans }) => {
			return <Par><Translation>We can cancel <CountingWord>{p}</CountingWord> factors <M>{factor1}</M> and <CountingWord>{r}</CountingWord> factors <M>{factor2}</M> from both the numerator and the denominator, resulting in <BM>{numericSimplified} = {ans}.</BM> This is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		numericSimplified: [originalExpression, nonEquivalentExpression, noFraction, unsimplifiedFractionNumbers, equivalentExpression],
		ans: [originalExpression, nonEquivalentExpression, noFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression],
	})
}
