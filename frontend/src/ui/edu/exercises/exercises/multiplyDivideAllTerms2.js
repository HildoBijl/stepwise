import React from 'react'

import { Integer, Fraction, expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { EquationInput } from 'ui/inputs'

import { useSolution } from 'ui/eduTools'
import { StepExercise } from 'ui/eduTools'

import { getInputFieldFeedback } from '../util/feedback'
import { originalEquation, incorrectEquation, correctEquation, correctEquationWithMessage, sumWithWrongTerms, sumWithUnsimplifiedTerms, hasSumWithinFraction } from '../util/feedbackChecks/equation'

const { onlyElementaryClean: expressionOnlyElementaryClean } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Deel alle termen in deze vergelijking door <M>{variables.x}</M> en simplificeer deze termen zoveel mogelijk.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={EquationInput.settings.basicMathAndPowers} validate={EquationInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Deel eerst de linkerkant en de rechterkant allebei door <M>{variables.x}.</M> Oftewel, schrijf de vergelijking als <BM>\frac(\left[\ldots\right])({variables.x}) = \frac(\left[\ldots\right])({variables.x})</BM> waarbij in plaats van <M>\left[\ldots\right]</M> de oorspronkelijke linker/rechterkant van de vergelijking staat.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediateWithBrackets" size="l" settings={EquationInput.settings.basicMathAndPowers} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, equation } = useSolution()
			return <Par>We schrijven letterlijk op, <BM>\frac({equation.left})({variables.x}) = \frac({equation.right})({variables.x}).</BM> Merk op dat, omdat we met beide kanten van de vergelijking hetzelfde doen, de vergelijking nog steeds klopt.</Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Splits de breuken links/rechts op in losse breuken. Je hoeft nog geen verdere simplificaties toe te passen.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediateWithoutBrackets" size="l" settings={EquationInput.settings.basicMathAndPowers} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, intermediateWithoutBrackets } = useSolution()
			return <Par>We splitsen de breuk op door elke term afzonderlijk door <M>{variables.x}</M> te delen. Het resultaat is <BM>{intermediateWithoutBrackets}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Simplificeer alle termen zo veel mogelijk.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={EquationInput.settings.basicMathAndPowers} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, ans } = useSolution()
			return <Par>Bij termen waar zowel boven als onder een <M>{variables.x}</M> staat strepen we deze weg. Bij één term staat er boven <M>{variables.x}^2.</M> Omdat <M>{variables.x}^2 = {variables.x} \cdot {variables.x}</M> valt er hier maar één factor <M>{variables.x}</M> weg, en blijft er boven nog <M>{variables.x}</M> over. Het eindresultaat is <BM>{ans}.</BM> Dit kan niet nog simpeler geschreven worden.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const ansCorrectEquation = correctEquationWithMessage(<>Je antwoord klopt, maar je kunt hem nog simpeler schrijven.</>)

	// Define intermediateWithBrackets checks.
	// There is a side that's not like [something]/x. (Ignore this if this side has zero or one term.)
	const formCheck = (input, correct, { variables, equation }) => input.someSide((side, part) => !Integer.zero.equals(equation[part]) && (!side.isSubtype(Fraction) || !variables.x.equals(side.denominator))) && <>Beide kanten van de vergelijking moeten van de vorm <M>\frac(\ldots)({variables.x})</M> zijn.</>
	// There is a side that does not contain the original expression part in the numerator. (Ignore this if this side is zero.)
	const insideBracketCheck = (input, correct, { equation }) => input.someSide((side, part) => !Integer.zero.equals(equation[part]) && (!side.isSubtype(Fraction) || !expressionOnlyElementaryClean(side.numerator, equation[part]))) && <>Je hebt in de tellers van de breuken niet letterlijk de delen uit de vorige vergelijking opgenomen.</>

	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'intermediateWithBrackets',
		'intermediateWithoutBrackets',
	], exerciseData, [
		[originalEquation, sumWithUnsimplifiedTerms, incorrectEquation, ansCorrectEquation],
		[formCheck, insideBracketCheck, incorrectEquation, correctEquation],
		[hasSumWithinFraction, sumWithWrongTerms, incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}
