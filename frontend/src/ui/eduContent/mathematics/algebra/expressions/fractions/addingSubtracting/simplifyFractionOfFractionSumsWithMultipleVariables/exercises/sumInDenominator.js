import React from 'react'

import { Translation } from 'i18n'
import { Par, SubHead, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

import { wrongDenominatorWithSCM, wrongNumerator } from './util'

const { originalExpression, noFraction, hasFractionWithinFraction, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression, nonEquivalentExpression } = expressionChecks

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
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Rewrite the sum of fractions <BM>{expression.denominator}</BM> as a single fraction. Simplify it as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="intermediate" prelabel={<M>{expression.denominator}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, fraction1, fraction2, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate }) => {
			return <Translation>
				<Par>To write the denominator <M>{expression.denominator}</M> as a single fraction, we first have to find the smallest common multiple of the two denominators <M>{fraction1.denominator}</M> and <M>{fraction2.denominator}</M>. This is <M>{intermediate.denominator}</M>. Both fractions should therefore get a denominator <M>{intermediate.denominator}</M>.</Par>
				<Par>For the first fraction, we multiply both sides by <M>{variables.y}</M>. This gives <BM>{fraction1} = {fraction1Intermediate}.</BM> For the second fraction, we multiply both sides by <M>{variables.x}</M>. This results in <BM>{fraction2} = {fraction2Intermediate}.</BM> If we merge these two fractions together, we wind up with <BM>{expression.denominator} = {intermediateSplit} = {intermediate}.</BM></Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { variables, expressionWithIntermediate } = useSolution()
			return <>
				<Par><Translation>Rewrite the fraction of fractions <BM>{expressionWithIntermediate}</BM> as a single fraction. Simplify it as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expressionWithIntermediate}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, expression, gcdValue, numerator, intermediate, ans }) => {
			return <Translation>
				<Par>When dividing something by a fraction, the rule says we may also multiply it by its inverse. So we can write this as <BM>{numerator.multiply(intermediate.invert())}.</BM> If we subsequently merge the fractions, as well as cancel the factor <M>{variables.x}</M> that appears in all terms on both sides, then we can simplify this to <BM>{ans}.</BM> This cannot be simplified further.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We could have also multiplied both sides of the original fraction by <M>{variables.x.toPower(2).multiply(variables.y).divide(gcdValue).regularClean()}</M>. After simplifying the inner fractions, we then directly find that <BM>{expression} = {ans}.</BM> However, this short-cut requires insights that are generally only obtained through lots of practice.</Par>
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
		unsimplifiedFractionNumbers,
		unsimplifiedFractionFactors,
		equivalentExpression,
	]

	// Define checks for intermediate.
	const intermediateChecks = [
		originalExpression,
		noFraction,
		hasFractionWithinFraction,
		wrongDenominatorWithSCM,
		wrongNumerator,
		nonEquivalentExpression,
		equivalentExpression,
	]

	return getFieldInputFeedback(exerciseData, { ans: ansChecks, intermediate: intermediateChecks })
}
