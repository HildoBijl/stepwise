import React from 'react'

import { gcd } from 'step-wise/util'
import { Fraction } from 'step-wise/CAS'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, equivalentExpression, nonEquivalentExpression, hasNegativeExponent, noFraction, hasFractionWithinFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors } = expressionChecks

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
				<Par><Translation>Write the expression without any negative exponents.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="noNegativeExponents" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, withoutNegativeExponents }) => {
			return <Par><Translation>Whenever we find a negative power like <M>a^(-b)</M> we replace it by the corresponding fraction <M>1/a^b</M>. Doing so results in <BM>{expression} = {withoutNegativeExponents}.</BM></Translation></Par>
		},
	},
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
		Solution: ({ flip, withoutNegativeExponents, part1WithoutNegativeExponents, part2WithoutNegativeExponents, singleFraction }) => {
			const numerator = flip ? part2WithoutNegativeExponents : part1WithoutNegativeExponents
			const denominator = flip ? part1WithoutNegativeExponents : part2WithoutNegativeExponents
			const flippedMultiplication = numerator.multiply(denominator.invert())
			return <Par><Translation><Check value={denominator.isSubtype(Fraction)}>
				<Check.True>When dividing by a fraction, we can also multiply by the inverse. This results in <BM>{withoutNegativeExponents} = {flippedMultiplication}.</BM> <Check value={numerator.isSubtype(Fraction)}><Check.True>These two fractions can subsequently be merged together, multiplying the numerator by the numerator and the denominator by the denominator.</Check.True><Check.False>We can merge this together, by pulling the multiplication on the left into the numerator.</Check.False></Check> This gives <BM>{flippedMultiplication} = {singleFraction}.</BM></Check.True>
				<Check.False>When dividing by a multiplication, this whole multiplication may also be put into the denominator. Doing so results in <BM>{withoutNegativeExponents} = {singleFraction}.</BM></Check.False>
			</Check></Translation></Par>
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
		Solution: ({ a, b, c, d, variables, expression, singleFraction, inBetween, ans }) => {
			const gcdValue = gcd(a, b)
			return <Par><Translation><Check value={gcdValue > 1}><Check.True>We can first divide the numerator and the denominator by <M>{gcdValue}</M>. This gives us <BM>{singleFraction} = {inBetween}.</BM></Check.True><Check.False>First we can see that there is no simplification possible for the number values.</Check.False></Check> Continuing with the variables, we can sort out the factors <M>{variables.x.add(c).removeUseless()}</M> and <M>{variables.x.add(d).removeUseless()}</M> to get <BM>{inBetween} = {ans}.</BM> This is as simplified as possible. Altogether, the final result is <BM>{expression} = {ans}.</BM></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		withoutNegativeExponent: [originalExpression, hasNegativeExponent, nonEquivalentExpression, noFraction, equivalentExpression],
		singleFraction: [originalExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, equivalentExpression],
		ans: [originalExpression, nonEquivalentExpression, noFraction, hasFractionWithinFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression],
	})
}
