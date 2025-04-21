import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, Substep, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

import { SCM, ansEquivalent, denominatorCorrect, denominatorEquivalent, denominatorNotSmallestMultiple, denominatorWrongFactor, denominatorMissingDependency, wrongDenominator, wrongNumerator, nonSimplifiedNumerator } from './util'

const { originalExpression, noFraction, hasFractionWithinFraction, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Write this as a single fraction and simplify the result as much as possible.</Translation></Par>
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
			const { variables, leftExpression, rightExpression } = useSolution()
			return <>
				<Par><Translation>Find the smallest common multiple of the two denominators <M>{leftExpression.denominator}</M> and <M>{rightExpression.denominator}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="denominator" prelabel={<SCM />} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, leftExpression, rightExpression, denominator }) => {
			return <Par><Translation>Because of <M>{leftExpression.denominator}</M> we need the factors <M>{variables.x}</M> and <M>{variables.z}</M>. Due to <M>{rightExpression.denominator}</M> we also require the factors <M>{variables.y}</M> and <M>{variables.z}</M>. All together, we hence need the factors <M>{variables.x}</M>, <M>{variables.y}</M> and <M>{variables.z}</M>. This gives the multiple <BM>{denominator}</BM>. This is the smallest common multiple of both <M>{leftExpression.denominator}</M> and <M>{rightExpression.denominator}</M>. The factor <M>{variables.z}</M> should <strong>not</strong> be present twice.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, leftExpression, rightExpression, denominator } = useSolution()
			return <>
				<Par><Translation>Rewrite both fractions so that they have <M>{denominator}</M> as denominator.</Translation></Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="leftAns" prelabel={<M>{leftExpression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} /></Substep>
						<Substep ss={2}><ExpressionInput id="rightAns" prelabel={<M>{rightExpression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, leftExpression, rightExpression, leftAns, rightAns, denominator }) => {
			return <Par><Translation>We multiply the first fraction above and below by <M>{leftAns.numerator}</M>. This gives <BM>{leftExpression} = {leftAns}.</BM> The second fraction is multiplied above and below by <M>{rightAns.numerator}</M>. This results in <BM>{rightExpression} = {rightAns}.</BM> Both fractions now have <M>{denominator}</M> as denominator.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Merge the two rewritten fractions into a single fraction.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ plus, expression, leftAns, rightAns, ans }) => {
			return <Par><Translation>If we put it all together, we find <BM>{expression} = {leftAns} {plus ? '+' : '-'} {rightAns} = {ans}.</BM> This has merged the two fractions into a single fraction. Because we used the smallest common multiple in the denominator, no further simplifications are possible.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Assemble the checks for all input fields.
	const ansChecks = [
		originalExpression,
		noFraction,
		ansEquivalent,
		denominatorCorrect,
		nonEquivalentExpression,
	]
	const denominatorChecks = [
		denominatorEquivalent,
		denominatorNotSmallestMultiple,
		denominatorWrongFactor,
		denominatorMissingDependency,
	]
	const fractionChecks = [
		originalExpression,
		noFraction,
		wrongDenominator,
		wrongNumerator,
		hasFractionWithinFraction,
		nonSimplifiedNumerator,
		equivalentExpression,
		nonEquivalentExpression,
	]

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: ansChecks, denominator: denominatorChecks, leftAns: fractionChecks, rightAns: fractionChecks })
}
