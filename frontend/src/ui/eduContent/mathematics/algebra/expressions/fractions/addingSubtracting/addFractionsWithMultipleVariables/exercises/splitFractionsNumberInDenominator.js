import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, Substep, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

import { correctFraction, nonSimplifiedTerms } from './util'

const { originalExpression, noSum, sumWithWrongTerms, noFraction, hasFractionWithinFraction, equivalentExpression, nonEquivalentExpression, incorrectFraction } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Split this fraction into separate fractions, each without any addition/subtraction inside of them. Simplify the result as much as possible.</Translation></Par>
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
			const { plus, variables, expression } = useSolution()
			return <>
				<Par><Translation>Split the fraction up into two fractions with a <Check value={plus}><Check.True>plus</Check.True><Check.False>minus</Check.False></Check> sign in-between. (Don't apply any further simplifications.)</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="split" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ plus, expression, leftExpression, rightExpression }) => {
			return <Par><Translation>When splitting up a fraction, the denominator (below) remains the same for both fractions. Only the numerator (above) will be split. This idea gives us <BM>{expression} = {leftExpression} {plus ? '+' : '-'} {rightExpression}.</BM> This has split up the fraction into two fractions that can still be simplified further.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, leftExpression, rightExpression } = useSolution()
			return <>
				<Par><Translation>Simplify both fractions as much as possible. Cancel out any factors appearing in both the numerator and the denominator.</Translation></Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="leftAns" prelabel={<M>{leftExpression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} /></Substep>
						<Substep ss={2}><ExpressionInput id="rightAns" prelabel={<M>{rightExpression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ leftExpression, rightExpression, leftAns, rightAns }) => {
			return <Par><Translation>At the first fraction we can cancel out the factor <M>{leftExpression.numerator}</M>. This results in <BM>{leftExpression} = {leftAns}.</BM> For the second fraction we cancel out <M>{rightExpression.numerator}</M> to find <BM>{rightExpression} = {rightAns}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { plus, variables, expression } = useSolution()
			return <>
				<Par><Translation>Write the two simplified fractions together in one expression, with once more a <Check value={plus}><Check.True>plus</Check.True><Check.False>minus</Check.False></Check> sign in-between.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ plus, expression, leftExpression, rightExpression, ans }) => {
			return <Par><Translation>The final result of the two fractions is <BM>{expression} = {leftExpression} {plus ? '+' : '-'} {rightExpression} = {ans}.</BM> These fractions are as simplified as we can possibly write them.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Assemble the checks for all input fields.
	const ansChecks = [
		originalExpression,
		noSum,
		sumWithWrongTerms,
		nonSimplifiedTerms,
		equivalentExpression,
		nonEquivalentExpression,
	]
	const splitChecks = [
		originalExpression,
		noSum,
		sumWithWrongTerms,
		equivalentExpression,
		nonEquivalentExpression,
	]
	const fractionChecks = [
		noFraction,
		hasFractionWithinFraction,
		correctFraction,
		incorrectFraction,
	]

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: ansChecks, split: splitChecks, leftAns: fractionChecks, rightAns: fractionChecks })
}
