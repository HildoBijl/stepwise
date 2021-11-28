import React from 'react'

import { Integer, Product, expressionChecks, equationChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { basicMathAndPowers } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalEquation, correctEquation, incorrectEquation, hasSumWithinProduct } from '../util/feedbackChecks/equation'

const { onlyOrderChanges: expressionOnlyOrderChanges } = expressionChecks
const { onlyOrderChanges: equationOnlyOrderChanges } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, equation } = useCorrect(state)
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Vermenigvuldig alle termen in deze vergelijking met <M>{variables.x}</M> en simplificeer deze termen zoveel mogelijk.</Par>
		<InputSpace>
			<Par>
				<EquationInput id="ans" label="Vul hier de vergelijking in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { variables } = useCorrect(state)
			return <>
				<Par>Vermenigvuldig eerst de linkerkant en de rechterkant allebei met <M>{variables.x}.</M> Oftewel, schrijf de vergelijking als <BM>\left(\ldots\right){variables.x} = \left(\ldots\right){variables.x}</BM> waarbij tussen haakjes de oorspronkelijke linker/rechterkant van de vergelijking staat.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediateWithBrackets" label="Vul hier de vergelijking in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, equation } = useCorrect(state)
			return <Par>We schrijven letterlijk op, <BM>\left({equation.left}\right){variables.x} = \left({equation.right}\right){variables.x}.</BM> Merk op dat, omdat we met beide kanten van de vergelijking hetzelfde doen, de vergelijking nog steeds klopt.</Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useCorrect(state)
			return <>
				<Par>Werk de haakjes uit. Je hoeft nog geen verdere simplificaties toe te passen.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="intermediateWithoutBrackets" label="Vul hier de vergelijking in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, intermediateWithoutBrackets } = useCorrect(state)
			return <Par>We werken de haakjes uit door elke term afzonderlijk met <M>{variables.x}</M> te vermenigvuldigen. Het resultaat is <BM>{intermediateWithoutBrackets}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useCorrect(state)
			return <>
				<Par>Simplificeer alle termen zo veel mogelijk.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="ans" label="Vul hier de vergelijking in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, intermediateWithXPulledIn, ans } = useCorrect(state)
			return <Par>Bij elke term brengen we <M>{variables.x}</M> binnenin de breuk. Hij komt dan bovenin te staan, als <BM>{intermediateWithXPulledIn}.</BM> Als <M>{variables.x}</M> boven en onder in de breuk staat strepen we dit tegen elkaar weg. Ook vervangen we <M>{variables.x} \cdot {variables.x}</M> voor <M>{variables.x}^2.</M> Het eindresultaat is <BM>{ans}.</BM> Dit kan niet nog simpeler geschreven worden.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const atIntermediateStep = {
		check: (correct, input, { intermediate }) => equationOnlyOrderChanges(intermediate, input),
		text: (correct, input, { isPositive }) => <>Je hebt de juiste term {isPositive > 0 ? 'van beide kanten afgehaald' : 'bij beide kanten opgeteld'}, maar vervolgens moet je nog wat wegstrepen.</>
	}
	const wrongSignUsed = { // Check if the user subtracted/added it on one side and did the opposite on the other side.
		check: (correct, input, { equation, termToMove, isLeft }) => equationOnlyOrderChanges(equation
			.applyToLeft(side => side[isLeft ? 'subtract' : 'add'](termToMove))
			.applyToRight(side => side[isLeft ? 'add' : 'subtract'](termToMove))
			.basicClean()
			, input),
		text: (correct, input, { isPositive }) => <>Als de term aan de ene kant {isPositive ? 'positief is (met plusteken)' : 'negatief is (met minteken)'} dan moet hij aan de andere kant {isPositive ? 'negatief worden (met minteken)' : 'positief worden (met plusteken)'}.</>,
	}

	// Define intermediateWithBrackets checks.
	const formCheck = { // There is a side that's not like [something]*x. (Ignore this if this side is zero.)
		check: (correct, input, { equation, variables }) => input.someSide((side, part) => !(side.isType(Product) && side.terms.length === 2 && side.terms.some(term => variables.x.equalsBasic(term))) && !correct[part].terms[0].equals(Integer.zero)), // There is a side that's not [something]*x, except when the correct answer is zero.
		text: (correct, input, { variables }) => <>Beide kanten van de vergelijking moeten van de vorm <M>\left(\ldots\right)\cdot {variables.x}</M> zijn.</>,
	}
	const insideBracketCheck = { // There is a side that does not contain the original expression part somewhere. (Ignore this if this side is zero.)
		check: (correct, input, { equation, variables }) => input.someSide((side, part) => !(side.isType(Product) && side.terms.some(term => expressionOnlyOrderChanges(term, correct[part].terms[0]))) && !correct[part].terms[0].equals(Integer.zero)),
		text: () => <>Je hebt tussen de haakjes niet letterlijk de delen uit de vorige vergelijking opgenomen.</>,
	}

	// Determine intermediateWithoutBrackets checks.

	// const TODO

	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'intermediateWithBrackets',
		'intermediateWithoutBrackets',
	], exerciseData, [
		[originalEquation, incorrectEquation, correctEquation],
		[formCheck, insideBracketCheck, incorrectEquation, correctEquation],
		[hasSumWithinProduct, incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}