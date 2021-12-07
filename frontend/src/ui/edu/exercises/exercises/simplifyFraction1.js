import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Simplificeer deze zo veel als mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { variables, expression } = useSolution(state)
			return <>
				<Par>Herschrijf de som van breuken <BM>{expression.denominator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="intermediate" prelabel={<M>{expression.denominator}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, fraction1, fraction2, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate } = useSolution(state)
			return <>
				<Par>Om de noemer <M>{expression.denominator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}</M> vinden. Deze kleinste veelvoud is <M>{intermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{intermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.y}.</M> Zo krijgen we <BM>{fraction1} = {fraction1Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.x}.</M> Dit geeft <BM>{fraction2} = {fraction2Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{expression.denominator} = {intermediateSplit} = {intermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, expressionWithIntermediate } = useSolution(state)
			return <>
				<Par>Herschrijf de breuk in de breuk <BM>{expressionWithIntermediate}</BM> als enkele breuk. Maak hem wederom zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expressionWithIntermediate}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, expression, gcdValue, numerator, intermediate, ans } = useSolution(state)
			return <>
				<Par>We hebben een breuk die we delen door een breuk. Door de regel "delen door een breuk is vermenigvuldigen met het omgekeerde" kunnen we dit schrijven als <BM>{numerator.multiplyBy(intermediate.invert())}.</BM> Als we deze breuken samenvoegen, en de factor <M>{variables.x}</M> die boven en onder in alle termen voorkomt wegstrepen, dan kunnen we dit simplificeren tot <BM>{ans}.</BM> Dit kan niet nog verder gesimplificeerd worden.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>Eventueel hadden we bij de oorspronkelijke uitdrukking ook direct de boven- en onderkant van de grote breuk met <M>{variables.x.toPower(2).multiplyBy(variables.y).divideBy(gcdValue).regularClean()}</M> kunnen vermenigvuldigen. Na het simplificeren van breuken binnenin vinden we dan direct <BM>{expression}={ans}.</BM> Deze short-cut vereist echter inzicht die je alleen via veel oefenen kan krijgen.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define checks for ans.
	const ansCorrectExpression = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <>De uitdrukking klopt wel, maar je kan hem nog verder simplificeren. Zijn er factoren die je boven/onder weg kunt strepen?</>

	const ansChecks = [
		originalExpression,
		incorrectExpression,
		noFraction,
		hasFractionWithinFraction,
		ansCorrectExpression,
	]

	// Define checks for intermediate.
	const intermediateOriginalExpression = (input, correct, { expression }) => onlyOrderChanges(input, expression.denominator) && <>Dit is de oorspronkelijke uitdrukking. Je hebt hier nog niets mee gedaan.</>
	
	const wrongIntermediateDenominator = (input, correct, { fraction1, fraction2 }) => !equivalent(correct.denominator, input.denominator) && <>Je breuk heeft niet de juiste noemer. Is je noemer wel de kleinste veelvoud van <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}?</M></>

	const wrongIntermediateNumerator = (input, correct) => !equivalent(correct.numerator, input.numerator) && <>De noemer klopt, maar er gaat iets mis in de teller van je breuk.</>
	
	const intermediateChecks = [
		intermediateOriginalExpression,
		noFraction,
		hasFractionWithinFraction,
		wrongIntermediateDenominator,
		wrongIntermediateNumerator,
		incorrectExpression,
		correctExpression,
	]

	return getInputFieldFeedback(['ans', 'intermediate'], exerciseData, [ansChecks, intermediateChecks].map(feedbackChecks => ({ feedbackChecks })))
}