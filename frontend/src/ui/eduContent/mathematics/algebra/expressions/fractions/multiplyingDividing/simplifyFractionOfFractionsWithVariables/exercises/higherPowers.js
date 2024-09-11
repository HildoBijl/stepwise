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
		Solution: ({ flip, expression, fraction1, fraction2, singleFraction }) => {
			const flippedMultiplication = flip ? fraction2.multiply(fraction1.invert()) : fraction1.multiply(fraction2.invert())
			return <Par><Translation>When dividing by a fraction, we can also multiply by the inverse. This gives <BM>{expression} = {flippedMultiplication}.</BM> These two fractions can subsequently be merged together, multiplying the numerator by the numerator and the denominator by the denominator. This results in <BM>{flippedMultiplication} = {singleFraction}.</BM></Translation></Par>
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
		Solution: ({ a, b, c, d, e, f, p, q, variables, expression, singleFraction, inBetween, ans }) => {
			const gcdValue = gcd(a * d, b * c)
			return <Par><Translation>We can merge number products<Check value={gcdValue > 1}><Check.True> and subsequently divide the numerator and the denominator by <M>{gcd(a * d, b * c)}</M></Check.True></Check>. This gives us <BM>{singleFraction} = {inBetween}.</BM> Next to that, we can cancel <CountingWord>{p}</CountingWord> factors of <M>\left({variables.x.add(e).removeUseless()}\right)</M> and <CountingWord>{q}</CountingWord> factors of <M>\left({variables.x.add(f).removeUseless()}\right)</M> from both sides. This results in <BM>{inBetween} = {ans}.</BM> This is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		singleFraction: [originalExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, equivalentExpression],
		ans: [originalExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression],
	})
}
