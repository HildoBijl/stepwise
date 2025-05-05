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
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
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
						<ExpressionInput id="numeratorIntermediate" prelabel={<M>{numerator}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ term1, fraction1, numerator, term1Intermediate, numeratorSplit, numeratorIntermediate }) => {
			return <Translation>
				<Par>To write the numerator <M>{numerator}</M> as a single fraction, we should turn <M>{term1}</M> into a fraction with denominator equal to <M>{fraction1.denominator}</M>. This can be accomplished by multiplying above and below by <M>{fraction1.denominator}</M>. This results in <BM>{term1} = {term1Intermediate}.</BM> We can now merge the fractions into <BM>{numerator} = {numeratorSplit} = {numeratorIntermediate}.</BM></Par>
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
						<ExpressionInput id="denominatorIntermediate" prelabel={<M>{denominator}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ term2, fraction2, denominator, term2Intermediate, denominatorSplit, denominatorIntermediate }) => {
			return <Translation>
				<Par>To write the denominator <M>{denominator}</M> as a single fraction, we should turn <M>{term2}</M> into a fraction with denominator equal to <M>{fraction2.denominator}</M>. This can be accomplished by multiplying above and below by <M>{fraction2.denominator}</M>. This results in <BM>{term2} = {term2Intermediate}.</BM> We can now merge the fractions into <BM>{denominator} = {denominatorSplit} = {denominatorIntermediate}.</BM></Par>
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
						<ExpressionInput id="ans" prelabel={<M>{intermediate}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expression, intermediate, ans }) => {
			return <Translation>
				<Par>When dividing something by a fraction, the rule says we may also multiply it by its inverse. So we can write this as <BM>{intermediate.numerator.multiply(intermediate.denominator.invert())}.</BM> If we subsequently merge the fractions, then we can simplify this to <BM>{ans}.</BM> Optionally we can also expand the brackets here, but this is not necessarily required.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We could have also multiplied both sides of the original fraction by <M>{variables.x.multiply(variables.y).simplify({ sortProducts: true })}</M>. After simplifying the inner fractions, we then directly find that <BM>{expression} = {ans.simplify({ expandProductsOfSums: true, sortProducts: true, mergeProductFactors: true, mergeSumNumbers: true })}.</BM> However, this short-cut requires insights that are generally only obtained through lots of practice.</Par>
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
