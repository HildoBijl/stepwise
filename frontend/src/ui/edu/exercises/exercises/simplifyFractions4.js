import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks'

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
			const { variables, numerator } = useCorrect(state)
			return <>
				<Par>Herschrijf de som van breuken <BM>{numerator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="numeratorIntermediate" prelabel={<M>{numerator}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, numerator, fraction1, fraction2, fraction1Intermediate, fraction2Intermediate, numeratorSplit, numeratorIntermediate } = useCorrect(state)
			return <>
				<Par>Om de teller <M>{numerator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}</M> vinden. Deze kleinste veelvoud is <M>{numeratorIntermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{numeratorIntermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.x}.</M> Zo krijgen we <BM>{fraction1} = {fraction1Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.w}.</M> Dit geeft <BM>{fraction2} = {fraction2Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{numerator} = {numeratorSplit} = {numeratorIntermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, denominator } = useCorrect(state)
			return <>
				<Par>Herschrijf de som van breuken <BM>{denominator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="denominatorIntermediate" prelabel={<M>{denominator}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, denominator, fraction3, fraction4, fraction3Intermediate, fraction4Intermediate, denominatorSplit, denominatorIntermediate } = useCorrect(state)
			return <>
				<Par>Om de noemer <M>{denominator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction3.denominator}</M> en <M>{fraction4.denominator}</M> vinden. Deze kleinste veelvoud is <M>{denominatorIntermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{denominatorIntermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.z}.</M> Zo krijgen we <BM>{fraction3} = {fraction3Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.y}.</M> Dit geeft <BM>{fraction4} = {fraction4Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{denominator} = {denominatorSplit} = {denominatorIntermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, intermediate } = useCorrect(state)
			return <>
				<Par>Herschrijf de breuk in de breuk <BM>{intermediate}</BM> als enkele breuk. Maak hem wederom zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{intermediate}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { intermediateFlipped, intermediateMerged, ans } = useCorrect(state)
			return <>
				<Par>We hebben een breuk die we delen door een breuk. Door de regel "delen door een breuk is vermenigvuldigen met het omgekeerde" kunnen we dit schrijven als <BM>{intermediateFlipped}.</BM> Deze twee breuken kunnen vervolgens samengevoegd worden tot <BM>{intermediateMerged}.</BM> Dit kan tenslotte nog wat simpeler/netter geschreven worden als <BM>{ans}.</BM></Par>
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

	return getInputFieldFeedback(['ans', 'numeratorIntermediate', 'denominatorIntermediate'], exerciseData, [ansChecks, intermediateChecks, intermediateChecks].map(feedbackChecks => ({ feedbackChecks })))
}