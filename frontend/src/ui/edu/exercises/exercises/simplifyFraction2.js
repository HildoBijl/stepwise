import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useCorrect(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Simplificeer dit zo veel als mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { variables, expression } = useCorrect(state)
			return <>
				<Par>Herschrijf de som van breuken <BM>{expression.numerator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="intermediate" prelabel={<M>{expression.numerator}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, gcdValue, fraction1, fraction2, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate } = useCorrect(state)
			return <>
				<Par>Om de teller <M>{expression.numerator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}</M> vinden. Deze kleinste veelvoud is <M>{intermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{intermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.b / gcdValue}.</M> Zo krijgen we <BM>{fraction1} = {fraction1Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.a / gcdValue}.</M> Dit geeft <BM>{fraction2} = {fraction2Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{expression.numerator} = {intermediateSplit} = {intermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, expressionWithIntermediate } = useCorrect(state)
			return <>
				<Par>Herschrijf de breuk in de breuk <BM>{expressionWithIntermediate}</BM> als enkele breuk. Maak hem wederom zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expressionWithIntermediate}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, gcdValue, expression, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans } = useCorrect(state)
			const factor = variables.a * variables.b / gcdValue
			return <>
				<Par>We hebben een breuk die we delen door een factor. In dit geval kunnen we de noemer ook direct met de factor vermenigvuldigen. Zo krijgen we <BM>{expressionWithIntermediate} = {simplifiedExpressionWithIntermediate} = {ans}.</BM> Dit kan niet nog verder gesimplificeerd worden.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>Eventueel hadden we in het begin ook direct de boven- en onderkant van de grote breuk met <M>{factor}</M> kunnen vermenigvuldigen. We hadden dan, na het simplificeren van de breuken bovenin, direct gevonden dat <BM>{expression}={ans}.</BM> Deze short-cut vereist echter inzicht die je alleen via veel oefenen kan krijgen.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define checks for ans.
	const ansCorrectExpression = {
		check: (correct, input) => equivalent(correct, input),
		text: <>De uitdrukking klopt wel, maar je kan hem nog verder simplificeren. Zijn er factoren die je boven/onder weg kunt strepen?</>,
	}
	const ansChecks = [
		originalExpression,
		incorrectExpression,
		noFraction,
		hasFractionWithinFraction,
		ansCorrectExpression,
	]

	// Define checks for intermediate.
	const intermediateOriginalExpression = {
		check: (correct, input, { expression }) => onlyOrderChanges(input, expression.denominator),
		text: <>Dit is de oorspronkelijke uitdrukking. Je hebt hier nog niets mee gedaan.</>,
	}
	const wrongIntermediateDenominator = {
		check: (correct, input) => !equivalent(correct.denominator, input.denominator),
		text: (correct, input, { fraction1, fraction2 }) => <>Je breuk heeft niet de juiste noemer. Is je noemer wel de kleinste veelvoud van <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}?</M></>,
	}
	const wrongIntermediateNumerator = {
		check: (correct, input) => !equivalent(correct.numerator, input.numerator),
		text: <>De noemer klopt, maar er gaat iets mis in de teller van je breuk.</>,
	}
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