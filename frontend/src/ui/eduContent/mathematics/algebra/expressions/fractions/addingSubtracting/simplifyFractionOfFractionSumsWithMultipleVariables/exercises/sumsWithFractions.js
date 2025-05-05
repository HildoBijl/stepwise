import React from 'react'

import { Translation } from 'i18n'
import { Par, SubHead, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

import { wrongDenominatorWithExpectation, wrongNumerator } from './util'

const { originalExpression, noFraction, hasFractionWithinFraction, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Simplify this as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, numerator } = useSolution()
			return <>
				<Par><Translation>Rewrite the sum of fractions <BM>{numerator}</BM> as a single fraction. Simplify it as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="numeratorIntermediate" prelabel={<M>{numerator}=</M>} size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, numerator, fraction1, fraction2, fraction1Intermediate, fraction2Intermediate, numeratorSplit, numeratorIntermediate }) => {
			return <Translation>
				<Par>To write the numerator <M>{numerator}</M> as a single fraction, we first have to find the smallest common multiple of the two denominators <M>{fraction1.denominator}</M> and <M>{fraction2.denominator}</M>. This is <M>{numeratorIntermediate.denominator}</M>. Both fractions should therefore get a denominator <M>{numeratorIntermediate.denominator}</M>.</Par>
				<Par>For the first fraction, we multiply both sides by <M>{variables.x}</M>. This gives <BM>{fraction1} = {fraction1Intermediate}.</BM> For the second fraction, we multiply both sides by <M>{variables.w}</M>. This results in <BM>{fraction2} = {fraction2Intermediate}.</BM> If we merge these two fractions together, we wind up with <BM>{numerator} = {numeratorSplit} = {numeratorIntermediate}.</BM></Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { variables, denominator } = useSolution()
			return <>
				<Par><Translation>Rewrite the sum of fractions <BM>{denominator}</BM> as a single fraction. Simplify it as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="denominatorIntermediate" prelabel={<M>{denominator}=</M>} size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, denominator, fraction3, fraction4, fraction3Intermediate, fraction4Intermediate, denominatorSplit, denominatorIntermediate }) => {
			return <Translation>
				<Par>To write the denominator <M>{denominator}</M> as a single fraction, we first have to find the smallest common multiple of the two denominators <M>{fraction3.denominator}</M> and <M>{fraction4.denominator}</M>. This is <M>{denominatorIntermediate.denominator}</M>. Both fractions should therefore get a denominator <M>{denominatorIntermediate.denominator}</M>.</Par>
				<Par>For the first fraction, we multiply both sides by <M>{variables.z}</M>. This gives <BM>{fraction3} = {fraction3Intermediate}.</BM> For the second fraction, we multiply both sides by <M>{variables.y}</M>. This results in <BM>{fraction4} = {fraction4Intermediate}.</BM> If we merge these two fractions together, we wind up with <BM>{denominator} = {denominatorSplit} = {denominatorIntermediate}.</BM></Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { variables, intermediate } = useSolution()
			return <>
				<Par><Translation>Rewrite the fraction of fractions <BM>{intermediate}</BM> as a single fraction. Simplify it as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{intermediate}=</M>} size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expression, gcdValue, intermediateFlipped, intermediateMerged, ans }) => {
			return <Translation>
				<Par>When dividing something by a fraction, the rule says we may also multiply it by its inverse. So we can write this as <BM>{intermediateFlipped}.</BM> If we subsequently merge the fractions, then we can simplify this to <BM>{intermediateMerged}.</BM> We could still reorder this a bit to <BM>{ans}.</BM></Par>
				<SubHead>Short-cut</SubHead>
				<Par>We could have also multiplied both sides of the original fraction by <M>{variables.w.multiply(variables.x).multiply(variables.y).multiply(variables.z).divide(gcdValue).regularClean()}</M>. After simplifying the inner fractions, we then directly find that <BM>{expression} = {ans.simplify({ expandProductsOfSums: true, sortProducts: true })}.</BM> However, this short-cut requires insights that are generally only obtained through lots of practice.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	// Define checks for ans.
	const ansChecks = [
		originalExpression,
		nonEquivalentExpression,
		noFraction,
		hasFractionWithinFraction,
		equivalentExpression,
	]

	// Define checks for intermediate.
	const numeratorChecks = [
		originalExpression,
		noFraction,
		hasFractionWithinFraction,
		wrongDenominatorWithExpectation,
		wrongNumerator,
		nonEquivalentExpression,
		equivalentExpression,
	]
	const denominatorChecks = [
		originalExpression,
		...numeratorChecks.slice(1),
	]

	return getFieldInputFeedback(exerciseData, { ans: ansChecks, numeratorIntermediate: numeratorChecks, denominatorIntermadiate: denominatorChecks })
}
