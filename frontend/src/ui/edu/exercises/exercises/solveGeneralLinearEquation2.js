import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { validWithVariables as expressionValidWithVariables, basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables as equationValidWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { hasX, hasFractionWithinFraction, incorrectFraction, incorrectExpression, correctExpression } from '../util/feedbackChecks/expression'
import { originalEquation, correctEquation, incorrectEquation, hasFraction, hasSumWithinProduct } from '../util/feedbackChecks/equation'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, equation } = useSolution(state)
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Los deze op voor <M>{variables.x}.</M> Simplificeer je antwoord zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={expressionValidWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Als eerste zien we aan de linkerkant een breuk binnen een breuk staan. Simplificeer dit tot een enkele breuk. (Laat de rechterkant van de vergelijking onveranderd staan.)</Par>
				<InputSpace>
					<Par>
						<EquationInput id="simplified" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, equation, simplified } = useSolution(state)
			return <Par>We kunnen de breuk in een breuk vereenvoudigen door boven en onder met zowel <M>{variables.w}</M> als <M>{variables.x}</M> te vermenigvuldigen. Hiermee reduceert de breuk tot <BM>{equation.left} = {simplified.left}.</BM> Als we dit invullen in de vergelijking, dan kunnen we hem schrijven als <BM>{simplified}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Vergelijkingen zijn een stuk makkelijker op te lossen als er geen breuken in zitten. Vermenigvuldig alle termen van de vergelijking met de noemers van beide breuken om dit voor elkaar te krijgen.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { simplified, multiplied } = useSolution(state)
			return <Par>We vermenigvuldigen beide kanten van de vergelijking met <M>{simplified.left.denominator}</M> en met <M>{simplified.right.denominator}.</M> Nadat we factoren wegstrepen blijven we over met <BM>{multiplied}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Werk alle haakjes uit.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { expanded } = useSolution(state)
			return <Par>Als we alles opsplitsen in losse termen, dan krijgen we <BM>{expanded}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Het resultaat is een lineaire vergelijking. Los deze op de normale wijze op voor <M>{variables.x}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={expressionValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, termToMove, shifted, pulledOut, bracketFactor, ans } = useSolution(state)
			return <Par>Voor het oplossen van een lineaire vergelijking brengen we eerst alle termen met <M>{variables.x}</M> naar de ene kant en alle termen zonder <M>{variables.x}</M> naar de andere kant. Oftewel, <M>{termToMove.abs()}</M> gaat naar links, zodat <BM>{shifted}.</BM> Vervolgens brengen we <M>{variables.x}</M> buiten haakjes. Dit zet het bovenstaande om in <BM>{pulledOut}.</BM> We delen tenslotte beide kanten van de vergelijking door <M>{bracketFactor}</M> om <M>{variables.x}</M> op te lossen. Het eindresultaat is <BM>{variables.x} = {ans}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const simplifiedChecks = [
		(input, correct) => !expressionChecks.onlyOrderChanges(input.right, correct.right) && <>Laat de rechter kant van de vergelijking onveranderd!</>,
		(input, correct, solution, isCorrect) => hasFractionWithinFraction(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => incorrectExpression(input.left, correct.left, solution, isCorrect),
		(input, correct, solution, isCorrect) => correctExpression(input.left, correct.left, solution, isCorrect),
	]

	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'simplified',
		'multiplied',
		'expanded',
	], exerciseData, [
		[hasX, incorrectFraction, incorrectExpression],
		simplifiedChecks,
		[originalEquation, hasFraction, incorrectEquation, correctEquation],
		[hasSumWithinProduct, hasFraction, incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}