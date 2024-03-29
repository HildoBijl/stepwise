import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, SubHead, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Simplificeer deze zo veel als mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par>Herschrijf de som van breuken <BM>{expression.numerator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="intermediate" prelabel={<M>{expression.numerator}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, gcdValue, fraction1, fraction2, expression, fraction1Intermediate, fraction2Intermediate, intermediateSplit, intermediate }) => {
			return <>
				<Par>Om de teller <M>{expression.numerator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}</M> vinden. Deze kleinste veelvoud is <M>{intermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{intermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.b / gcdValue}.</M> Zo krijgen we <BM>{fraction1} = {fraction1Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.a / gcdValue}.</M> Dit geeft <BM>{fraction2} = {fraction2Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{expression.numerator} = {intermediateSplit} = {intermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => {
			const { variables, expressionWithIntermediate } = useSolution()
			return <>
				<Par>Herschrijf de breuk in de breuk <BM>{expressionWithIntermediate}</BM> als enkele breuk. Maak hem wederom zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expressionWithIntermediate}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, gcdValue, expression, expressionWithIntermediate, simplifiedExpressionWithIntermediate, ans }) => {
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

	return getFieldInputFeedback(exerciseData, { ans: ansChecks, intermediate: intermediateChecks})
}
