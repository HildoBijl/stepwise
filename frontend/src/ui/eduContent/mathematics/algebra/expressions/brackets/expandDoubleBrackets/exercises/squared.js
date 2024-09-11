import React from 'react'

import { Translation } from 'i18n'
import { Par, SubHead, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

import { bracketProductRemains, stillHasPower } from './util'

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
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Use the definition of the square to rewrite <M>{expression}</M> as a multiplication <M>\left(\ldots\right)\left(\ldots\right)</M> without any square outside the brackets.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="multiplication" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, multiplication }) => {
			return <Par><Translation>A square simply means an expression multiplied by itself. So we can write <BM>{expression} = {multiplication}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par><Translation>Expand the left set of brackets, while keeping the right set of brackets intact. Treat the right set of brackets as a single number, which technically it is.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="firstExpanded" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.polynomes} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, multiplication, firstExpanded }) => {
			return <Par><Translation>We multiply each of the terms <M>{factor.terms[0]}</M> and <M>{factor.terms[1]}</M> in the left set of brackets by the full right brackets. This results in <BM>{multiplication} = {firstExpanded}.</BM></Translation></Par>
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
		Solution: ({ expression, variables, allExpanded, ans, xFactors, xFactorsMerged }) => {
			return <Translation>
				<Par>There are two terms that have <M>{variables.x}</M> as a factor, being <M>{xFactors[0]}</M> and again <M>{xFactors[1]}</M>. Together these can be written as <M>{xFactorsMerged}</M>. The resulting expression then becomes <BM>{allExpanded} = {ans}.</BM> This is our final answer. In short, <M>{expression} = {ans}</M>.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>There is a possible short-cut for this question. A square of a sum, like <M>\left(a+b\right)^2</M>, always comes out as <M>a^2 + 2ab + b^2</M>. Using this knowledge, we could have also directly seen that <BM>{expression} = {ans}.</BM></Par>
			</Translation>
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
		bracketProductRemains,
		sumWithWrongTerms,
		nonEquivalentExpression,
		equivalentExpression,
	]
	const multiplicationChecks = [
		originalExpression,
		stillHasPower,
		nonEquivalentExpression,
		equivalentExpression,
	]
	return getFieldInputFeedback(exerciseData, {
		multiplication: multiplicationChecks,
		firstExpanded: firstExpandedFeedbackChecks,
		allExpanded: feedbackChecks,
		ans: feedbackChecks,
	})
}
