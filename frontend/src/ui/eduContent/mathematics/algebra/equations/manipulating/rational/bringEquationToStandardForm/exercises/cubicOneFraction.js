import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

const { originalEquation, hasXInDenominator, incorrectEquation, sumWithWrongTerms, sumWithUnsimplifiedTerms, hasSumWithinProduct } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { equation, normalize, variables } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Bring this equation to the standard form and <Check value={normalize}><Check.True>normalize the result</Check.True><Check.False>ensure that the coefficients are all integers that are as small as possible</Check.False></Check>.</Translation></Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Make sure that <M>{variables.x}</M> does not appear in any denominator anymore.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, multiplied }) => {
			return <Par><Translation>There is only one fraction with <M>{variables.x}</M> in the denominator. So we multiply both sides of the equation by this denominator. This gives us <BM>{multiplied}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Expand all brackets.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expanded }) => {
			return <Par><Translation>Expanding all brackets turns the equation into <BM>{expanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Move all terms to the left and merge similar terms together, minimizing the number of terms in the equation.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="moved" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ merged, moved }) => {
			return <Par><Translation>By moving all terms to the left and by merging similar terms, we can find that <BM>{moved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables, normalize } = useSolution()
			return <>
				<Par><Translation>Make sure that the terms are sorted by decreasing power of <M>{variables.x}</M>. On top of this, <Check value={normalize}><Check.True>normalize the equation</Check.True><Check.False>ensure that the coefficients are all integers that are as small as possible</Check.False></Check>.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, normalize, divisor, ans }) => {
			return <Par><Translation>Note that in the previous step we already sorted the terms. The only thing that is left to do is clean up the coefficients. <Check value={normalize}><Check.True>To normalize the equation, we divide by the factor before the highest power of <M>{variables.x}</M>. That is, we divide all terms by <M>{divisor}</M>. This results in <BM>{ans}.</BM> This is the normalized version of the equation.</Check.True><Check.False>Note that all coefficients of the equation have a factor in common. Specifically, we can divide them all by <M>{divisor}</M> without obtaining any fractions. Doing so will result in <BM>{ans}.</BM> This equation is as simplified as it can be.</Check.False></Check></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		multiplied: [originalEquation, hasXInDenominator, incorrectEquation],
		expanded: [originalEquation, hasXInDenominator, hasSumWithinProduct, incorrectEquation],
		moved: [originalEquation, sumWithWrongTerms],
		ans: [originalEquation, sumWithUnsimplifiedTerms],
	})
}
