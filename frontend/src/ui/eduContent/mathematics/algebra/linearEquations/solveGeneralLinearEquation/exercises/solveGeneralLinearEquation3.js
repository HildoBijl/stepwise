import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { hasX, hasFractionWithinFraction, incorrectFraction, hasPower, nonEquivalentExpression, equivalentExpression } = expressionChecks
const { originalEquation, correctEquation, incorrectEquation, hasFraction } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Los deze op voor <M>{variables.x}.</M> Simplificeer je antwoord zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Als eerste zien we aan de linkerkant een breuk binnen een breuk staan. Simplificeer deze zo veel mogelijk. (Laat de rechterkant van de vergelijking onveranderd staan.)</Par>
				<InputSpace>
					<Par>
						<EquationInput id="simplified" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { b } = state
			const { variables, equation, simplified } = useSolution()
			return <Par>We kunnen de breuk in een breuk vereenvoudigen door de teller en de noemer beiden met <M>{variables.y}</M> te vermenigvuldigen en door <M>{variables.x}</M> te delen. {b > 0 ? 'Hiermee' : 'Hiermee, en via het wegstrepen van mintekens,'} reduceert de breuk tot <BM>{equation.left} = {equation.left.multiplyNumDen(variables.y.divide(variables.x))} = {simplified.left}.</BM> Als we dit invullen in de vergelijking, dan kunnen we hem schrijven als <BM>{simplified}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Vergelijkingen zijn een stuk makkelijker op te lossen als er geen breuken in zitten. Vermenigvuldig alle termen van de vergelijking met de noemer van de breuk links om dit voor elkaar te krijgen.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ simplified, multiplied }) => {
			return <Par>We vermenigvuldigen beide kanten van de vergelijking met <M>{simplified.left.denominator}.</M> Nadat we factoren wegstrepen blijven we over met <BM>{multiplied}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Het resultaat is een lineaire vergelijking. Los deze op de normale wijze op voor <M>{variables.x}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, shifted, pulledOut, bracketFactor, ans }) => {
			return <Par>Voor het oplossen van een lineaire vergelijking brengen we eerst alle termen met <M>{variables.x}</M> naar de ene kant en alle termen zonder <M>{variables.x}</M> naar de andere kant. Hier is het makkelijker om <M>{variables.x}</M> naar rechts te halen, zodat <BM>{shifted}.</BM> Vervolgens brengen we <M>{variables.x}</M> buiten haakjes. Dit zet het bovenstaande om in <BM>{pulledOut}.</BM> We delen ten slotte beide kanten van de vergelijking door <M>{bracketFactor}</M> om <M>{variables.x}</M> op te lossen. Het eindresultaat is <BM>{variables.x} = {ans}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const simplifiedChecks = [
		(input, correct) => !expressionComparisons.onlyOrderChanges(input.right, correct.right) && <>Laat de rechter kant van de vergelijking onveranderd!</>,
		(input, correct, solution, isCorrect) => hasFractionWithinFraction(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => hasPower(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => nonEquivalentExpression(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => equivalentExpression(input.left, correct.left, solution, isCorrect),
	]

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, {
		ans: [hasX, incorrectFraction, nonEquivalentExpression],
		simplified: simplifiedChecks,
		multiplied: [originalEquation, hasFraction, incorrectEquation, correctEquation],
	})
}
