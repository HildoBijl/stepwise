import React from 'react'

import { Sum, Fraction, expressionComparisons } from 'step-wise/CAS'
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
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Divide all terms by <M>{factor}</M> and simplify each resulting term as much as possible.</Translation></Par>
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
				<Par><Translation>Divide both sides of the equation by <M>{factor}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="form" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ factor, form }) => {
			return <Par><Translation>When we divide a side of an equation by <M>{factor}</M> it is important to put the entire original expression in the numerator (above). Doing so results in <BM>{form}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Split up all fractions into separate fractions, so that there is no sum in any numerator anymore.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expanded }) => {
			return <Par><Translation>When splitting up a fraction, we divide every term in the numerator (above) separately by the entire denominator (below). This turns the equation into <BM>{expanded}.</BM></Translation></Par>
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
		Solution: ({ variables, ansIntermediate, ans, factor }) => {
			return <Par><Translation>First we can cancel out any shared numerical factors. This gets us <BM>{ansIntermediate}.</BM> If we then also cross out factors of <M>{variables.x}</M>, we end up with <BM>{ans}.</BM> Note that every term has been divided individually by the factor <M>{factor}</M>.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Set up checks to check the form of the first step, first checking if the factor is set up properly and then whether or not the original expression has been copied properly.
	const incorrectForm = (input, correct, { equation, factor }, isCorrect, { translateCrossExercise }) => !isCorrect && input.findSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Fraction) && onlyOrderChanges(side.denominator, factor)) && translateCrossExercise(incorrectFormMessage(part, <M>\frac(\left(\ldots\right))({factor})</M>), 'incorrectForm'))?.value
	const incorrectCopy = (input, correct, { equation }, isCorrect, { translateCrossExercise }) => !isCorrect && input.findSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Fraction) && onlyOrderChanges(side.numerator, equation[part])) && translateCrossExercise(incorrectCopyMessage(part), 'incorrectCopy'))?.value

	// Assemble all the feedback checks.
	return getFieldInputFeedback(exerciseData, {
		form: [originalEquation, incorrectForm, incorrectCopy],
		expanded: [originalEquation, hasSumWithinProduct, sumWithWrongTerms],
		ans: [originalEquation, hasSumWithinProduct, sumWithUnsimplifiedTerms],
	})
}
