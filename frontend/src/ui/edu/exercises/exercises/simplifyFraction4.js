import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Schrijf dit als een enkele breuk.</Par>
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
			const { variables, numerator } = useSolution(state)
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
			const { variables, numerator, fraction1, fraction2, fraction1Intermediate, fraction2Intermediate, numeratorSplit, numeratorIntermediate } = useSolution(state)
			return <>
				<Par>Om de teller <M>{numerator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction1.denominator}</M> en <M>{fraction2.denominator}</M> vinden. Deze kleinste veelvoud is <M>{numeratorIntermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{numeratorIntermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.x}.</M> Zo krijgen we <BM>{fraction1} = {fraction1Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.w}.</M> Dit geeft <BM>{fraction2} = {fraction2Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{numerator} = {numeratorSplit} = {numeratorIntermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, denominator } = useSolution(state)
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
			const { variables, denominator, fraction3, fraction4, fraction3Intermediate, fraction4Intermediate, denominatorSplit, denominatorIntermediate } = useSolution(state)
			return <>
				<Par>Om de noemer <M>{denominator}</M> als één breuk te schrijven, moeten we eerst de kleinste veelvoud van de twee noemers <M>{fraction3.denominator}</M> en <M>{fraction4.denominator}</M> vinden. Deze kleinste veelvoud is <M>{denominatorIntermediate.denominator}.</M> Beide breuken moeten dus een noemer <M>{denominatorIntermediate.denominator}</M> krijgen.</Par>
				<Par>Voor de eerste breuk vermenigvuldigen we boven en onder met <M>{variables.z}.</M> Zo krijgen we <BM>{fraction3} = {fraction3Intermediate}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{variables.y}.</M> Dit geeft <BM>{fraction4} = {fraction4Intermediate}.</BM> Als we deze breuken samenvoegen, dan vinden we <BM>{denominator} = {denominatorSplit} = {denominatorIntermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, intermediate } = useSolution(state)
			return <>
				<Par>Herschrijf de breuk in de breuk <BM>{intermediate}</BM> als enkele breuk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{intermediate}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, expression, gcdValue, intermediateFlipped, intermediateMerged, ans } = useSolution(state)
			return <>
				<Par>We hebben een breuk die we delen door een breuk. Door de regel "delen door een breuk is vermenigvuldigen met het omgekeerde" kunnen we dit schrijven als <BM>{intermediateFlipped}.</BM> Deze twee breuken kunnen vervolgens samengevoegd worden tot <BM>{intermediateMerged}.</BM> Dit kan ten slotte nog wat simpeler/netter geschreven worden als <BM>{ans}.</BM></Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden deze opgave ook op kunnen lossen door de boven- en onderkant van de breuk met <M>{variables.w.multiplyBy(variables.x).multiplyBy(variables.y).multiplyBy(variables.z).divideBy(gcdValue).regularClean()}</M> te vermenigvuldigen. Na het wegstrepen van factoren vinden we dan direct dat <BM>{expression}={ans.simplify({ expandProductsOfSums: true, sortProducts: true })}.</BM> Deze short-cut vereist echter inzicht die je alleen via veel oefenen kan krijgen.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define checks for ans.
	const ansChecks = [
		originalExpression,
		incorrectExpression,
		noFraction,
		hasFractionWithinFraction,
		correctExpression,
	]

	// Define checks for intermediate.
	const numeratorOriginalExpression = (input, correct, { numerator }) => onlyOrderChanges(input, numerator) && <>Dit is de oorspronkelijke uitdrukking. Je hebt hier nog niets mee gedaan.</>

	const denominatorOriginalExpression = (input, correct, { denominator }) => onlyOrderChanges(input, denominator) && <>Dit is de oorspronkelijke uitdrukking. Je hebt hier nog niets mee gedaan.</>

	const wrongIntermediateDenominator = (input, correct) => !equivalent(correct.denominator, input.denominator) && <>Je breuk heeft niet de juiste noemer. Hoezo maak je geen breuk met noemer <M>{correct.denominator}?</M></>

	const wrongIntermediateNumerator = (input, correct) => !equivalent(correct.numerator, input.numerator) && <>De noemer klopt, maar er gaat iets mis in de teller van je breuk.</>

	const numeratorChecks = [
		numeratorOriginalExpression,
		noFraction,
		hasFractionWithinFraction,
		wrongIntermediateDenominator,
		wrongIntermediateNumerator,
		incorrectExpression,
		correctExpression,
	]
	const denominatorChecks = [
		denominatorOriginalExpression,
		...numeratorChecks.slice(1),
	]

	return getInputFieldFeedback(['ans', 'numeratorIntermediate', 'denominatorIntermediate'], exerciseData, [ansChecks, numeratorChecks, denominatorChecks].map(feedbackChecks => ({ feedbackChecks })))
}