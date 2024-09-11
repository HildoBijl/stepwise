import React from 'react'

import { gcd } from 'step-wise/util'

import { Translation, CountingWord, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, equivalentExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors } = expressionChecks

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
				<Par><Translation>Write the fraction of fractions as a single fraction.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="singleFraction" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ flip, expression, singleFraction }) => {
			return <Par><Translation><Check value={flip}><Check.True>When dividing a fraction by a factor, it's also allowed to add that factor to the denominator.</Check.True><Check.False>When dividing by a fraction, we can also multiply by the inverse. The outside factor (the original numerator) can subsequently be pulled into the numerator.</Check.False></Check> This gives <BM>{expression} = {singleFraction}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Simplify the resulting fraction as much as possible, canceling both numeric and variable factors.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ a, b, c, p, variables, expression, singleFraction, ans }) => {
			return <Par><Translation>We can divide the numerator and the denominator by <M>{gcd(a, b)}</M>. Next to that, we can cancel <CountingWord>{p}</CountingWord> factors of <M>\left({variables.x.add(c).removeUseless()}\right)</M> from both sides. This results in <BM>{singleFraction} = {ans}.</BM> This is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		singleFraction: [originalExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, equivalentExpression],
		ans: [originalExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression],
	})
}
