import React from 'react'

import { Product, Sum, expressionComparisons } from 'step-wise/CAS'
import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

const { originalEquation, sumWithWrongTerms, sumWithUnsimplifiedTerms, hasSumWithinProduct } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { equation, factor, variables } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Multiply all terms by <M>{factor}</M> and simplify each resulting term as much as possible.</Translation></Par>
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
			const { variables, factor } = useSolution()
			return <>
				<Par><Translation>Multiply both sides of the equation by <M>{factor}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="form" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, form }) => {
			return <Par><Translation>When we multiply each side of the equation by <M>{factor}</M> it is important to use brackets. Doing so results in <BM>{form}.</BM> Note that it does not matter if we put the multiplication on the left or on the right: this comes down to the same.</Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Expand all the brackets that are present.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expandedIntermediate, expanded }) => {
			return <Par><Translation>To expand the brackets, we multiply each of the terms within brackets separately by the factor outside of the brackets. This gives <BM>{expandedIntermediate}.</BM> It is wise to already simplify the products a bit further, giving us <BM>{expanded}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Simplify each of the resulting terms as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, ans, factor }) => {
			return <Par><Translation>The only thing left to do is crossing out factors of <M>{variables.x}</M>. We end up with <BM>{ans}.</BM> Note that every term has been multiplied individually by the factor <M>{factor}</M>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up checks to check the form of the first step, first checking if the factor is set up properly and then whether or not the original expression has been copied properly.
	const incorrectFactor = (input, correct, { variables, equation, e, factor }, isCorrect, { translateCrossExercise }) => !isCorrect && input.findSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Product) && side.terms.length === (e === 1 ? 2 : 3) && side.terms.some(term => term.equalsBasic(variables.x)) && (e === 1 || side.terms.some(term => term.equalsBasic(e)))) && translateCrossExercise(<>Both sides should be of the form <M>{factor} \cdot \left(\ldots\right)</M>. Your <Check value={part === 'left'}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side is not set up this way.</>, 'incorrectFactor'))?.value
	const incorrectPartInBrackets = (input, correct, { variables, equation, e, factor }, isCorrect, { translateCrossExercise }) => !isCorrect && input.findSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Product) && side.terms.some(term => expressionComparisons.onlyOrderChanges(term, equation[part]))) && translateCrossExercise(<>It looks like you didn't copy the original equation properly on the <Check value={part === 'left'}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side.</>, 'incorrectPartInBrackets'))?.value

	// Assemble all the feedback checks.
	return getFieldInputFeedback(exerciseData, {
		form: [originalEquation, incorrectFactor, incorrectPartInBrackets],
		expanded: [originalEquation, hasSumWithinProduct, sumWithWrongTerms],
		ans: [originalEquation, hasSumWithinProduct, sumWithUnsimplifiedTerms],
	})
}
