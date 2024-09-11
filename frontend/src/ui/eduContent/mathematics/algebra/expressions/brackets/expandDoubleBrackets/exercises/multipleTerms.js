import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

import { wrongBracketsExpanded } from './util'

const { originalExpression, sumWithWrongTerms, hasSumWithinProduct, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par><Translation>Consider the expression <BM>{expression}.</BM> Expand the brackets and simplify the result as much as possible.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, factor1, factor2, expression } = useSolution()
			return <>
				<Par><Translation>Expand the left set of brackets (here <M>{factor1}</M>) while keeping the right set of brackets (here <M>{factor2}</M>) intact. Treat the right set of brackets as a single number, which technically it is.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="firstExpanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, factor1, firstExpanded }) => {
			return <Par><Translation>We multiply each of the terms <M>{factor1.terms[0]}</M> and <M>{factor1.terms[1]}</M> in the left set of brackets by the full right brackets. This results in <BM>{expression} = {firstExpanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Expand all remaining brackets.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="allExpanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ firstExpanded, allExpanded }) => {
			return <Par><Translation>Expanding the remaining brackets in the usual way results in <BM>{firstExpanded} = {allExpanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Merge similar terms (with equal power of <M>{variables.x}</M>) together to simplify the result as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, variables, allExpanded, ans, xFactors1, xFactors2, xFactors1Merged, xFactors2Merged }) => {
			return <Par><Translation>There are two terms that have <M>{variables.x}</M> as a factor, being <M>{xFactors1[0]}</M> and <M>{xFactors1[1]}</M>. Together these can be written as <M>{xFactors1Merged}</M>. Identically, <M>{xFactors2[0]}</M> and <M>{xFactors2[1]}</M> can be merged into <M>{xFactors2Merged}</M>. The resulting expression then becomes <BM>{allExpanded} = {ans}.</BM> This is our final answer. In short, <M>{expression} = {ans}</M>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		hasSumWithinProduct,
		sumWithWrongTerms,
		nonEquivalentExpression,
		equivalentExpression,
	]
	const firstExpandedFeedbackChecks = [
		originalExpression,
		wrongBracketsExpanded,
		sumWithWrongTerms,
		nonEquivalentExpression,
		equivalentExpression,
	]
	return getFieldInputFeedback(exerciseData, {
		firstExpanded: firstExpandedFeedbackChecks,
		allExpanded: feedbackChecks,
		ans: feedbackChecks,
	})
}
