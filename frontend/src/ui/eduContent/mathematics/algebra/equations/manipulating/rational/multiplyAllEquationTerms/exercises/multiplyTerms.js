import React from 'react'

import { Product, Sum, expressionComparisons } from 'step-wise/CAS'
import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, equationChecks } from 'ui/eduTools'

import { incorrectFormMessage, incorrectCopyMessage } from './util'

const { onlyOrderChanges } = expressionComparisons
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
			return <Par><Translation>When we multiply a side of an equation by <M>{factor}</M> it is important to use brackets. Doing so results in <BM>{form}.</BM> Note that it does not matter if we put the multiplication on the left or on the right: this comes down to the same.</Translation></Par>
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
			return <Par><Translation>The only thing left to do is simplifying the fractions by crossing out factors of <M>{variables.x}</M>. We end up with <BM>{ans}.</BM> Note that every term has been multiplied individually by the factor <M>{factor}</M>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up checks to check the form of the first step, first checking if the factor is set up properly and then whether or not the original expression has been copied properly.
	const incorrectForm = (input, correct, { equation, e, factor }, isCorrect, { translateCrossExercise }) => !isCorrect && input.findSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Product) && side.terms.length === (e === 1 ? 2 : 3) && (e === 1 ? side.terms.some(term => onlyOrderChanges(term, factor)) : (side.terms.some(term => onlyOrderChanges(factor.terms[0], term)) && side.terms.some(term => onlyOrderChanges(factor.terms[1], term))))) && translateCrossExercise(incorrectFormMessage(part, <M>{factor} \cdot \left(\ldots\right)</M>), 'incorrectForm'))?.value
	const incorrectCopy = (input, correct, { equation }, isCorrect, { translateCrossExercise }) => !isCorrect && input.findSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Product) && side.terms.some(term => onlyOrderChanges(term, equation[part]))) && translateCrossExercise(incorrectCopyMessage(part), 'incorrectCopy'))?.value

	// Assemble all the feedback checks.
	return getFieldInputFeedback(exerciseData, {
		form: [originalEquation, incorrectForm, incorrectCopy],
		expanded: [originalEquation, hasSumWithinProduct, sumWithWrongTerms],
		ans: [originalEquation, hasSumWithinProduct, sumWithUnsimplifiedTerms],
	})
}
