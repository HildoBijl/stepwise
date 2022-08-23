import React from 'react'

import { Sum, Product, expressionComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { basicMathAndPowers } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalEquation, incorrectEquation, correctEquation, correctEquationWithMessage, sumWithWrongTerms, sumWithUnsimplifiedTerms, hasSumWithinProduct } from '../util/feedbackChecks/equation'

const { onlyElementaryClean: expressionOnlyElementaryClean } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Vermenigvuldig alle termen in deze vergelijking met <M>{variables.x}</M> en simplificeer deze termen zoveel mogelijk.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Vermenigvuldig eerst de linkerkant en de rechterkant allebei met <M>{variables.x}.</M> Oftewel, schrijf de vergelijking als <BM>\left(\ldots\right){variables.x} = \left(\ldots\right){variables.x}</BM> waarbij tussen haakjes de oorspronkelijke linker/rechterkant van de vergelijking staat.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediateWithBrackets" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, equation } = useSolution()
			return <Par>We schrijven letterlijk op, <BM>\left({equation.left}\right){variables.x} = \left({equation.right}\right){variables.x}.</BM> Merk op dat, omdat we met beide kanten van de vergelijking hetzelfde doen, de vergelijking nog steeds klopt.</Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Werk de haakjes uit. Je hoeft nog geen verdere simplificaties toe te passen.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediateWithoutBrackets" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, intermediateWithoutBrackets } = useSolution()
			return <Par>We werken de haakjes uit door elke term afzonderlijk met <M>{variables.x}</M> te vermenigvuldigen. Het resultaat is <BM>{intermediateWithoutBrackets}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Simplificeer alle termen zo veel mogelijk.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, intermediateWithXPulledIn, ans } = useSolution()
			return <Par>Bij elke term brengen we <M>{variables.x}</M> binnenin de breuk. Hij komt dan bovenin te staan, als <BM>{intermediateWithXPulledIn}.</BM> Als <M>{variables.x}</M> boven en onder in de breuk staat strepen we dit tegen elkaar weg. Ook vervangen we <M>{variables.x} \cdot {variables.x}</M> voor <M>{variables.x}^2.</M> Het eindresultaat is <BM>{ans}.</BM> Dit kan niet nog simpeler geschreven worden.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const ansCorrectEquation = correctEquationWithMessage(<>Je antwoord klopt, maar je kunt hem nog simpeler schrijven.</>)

	// Define intermediateWithBrackets checks.
	// There is a side that's not like [something]*x. (Ignore this if this side has zero or one term.)
	const formCheck = (input, correct, { variables, equation }) => input.someSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Product) && side.terms.length === 2 && side.terms.some(term => variables.x.equalsBasic(term)))) && <>Beide kanten van de vergelijking moeten van de vorm <M>\left(\ldots\right)\cdot {variables.x}</M> zijn.</>
	// There is a side that does not contain the original expression part somewhere. (Ignore this if this side is zero.)
	const insideBracketCheck = (input, correct, { equation }) => input.someSide((side, part) => equation[part].isSubtype(Sum) && !(side.isSubtype(Product) && side.terms.some(term => expressionOnlyElementaryClean(term, correct[part].terms[0])))) && <>Je hebt tussen de haakjes niet letterlijk de delen uit de vorige vergelijking opgenomen.</>
	
	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'intermediateWithBrackets',
		'intermediateWithoutBrackets',
	], exerciseData, [
		[originalEquation, sumWithUnsimplifiedTerms, incorrectEquation, ansCorrectEquation],
		[formCheck, insideBracketCheck, incorrectEquation, correctEquation],
		[hasSumWithinProduct, sumWithWrongTerms, incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}