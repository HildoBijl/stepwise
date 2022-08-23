import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Herschrijf dit tot een enkele breuk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, numerator } = useSolution()
			return <>
				<Par>Herschrijf de som <BM>{numerator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="numeratorIntermediate" prelabel={<M>{numerator}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { term1, fraction1, numerator, term1Intermediate, numeratorSplit, numeratorIntermediate } = useSolution()
			return <>
				<Par>Om de teller <M>{numerator}</M> als één breuk te schrijven, moeten we van <M>{term1}</M> eerst een breuk maken met noemer <M>{fraction1.denominator}.</M> Dit kan als we boven en onder vermenigvuldigen met <M>{fraction1.denominator}.</M> Zo krijgen we <BM>{term1} = {term1Intermediate}.</BM> We kunnen de breuken vervolgens samenvoegen als <BM>{numerator} = {numeratorSplit} = {numeratorIntermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => {
			const { variables, denominator } = useSolution()
			return <>
				<Par>Herschrijf de som <BM>{denominator}</BM> als een enkele breuk. Maak deze zo simpel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="denominatorIntermediate" prelabel={<M>{denominator}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { term2, fraction2, denominator, term2Intermediate, denominatorSplit, denominatorIntermediate } = useSolution()
			return <>
				<Par>Om de noemer <M>{denominator}</M> als één breuk te schrijven, moeten we van <M>{term2}</M> eerst een breuk maken met noemer <M>{fraction2.denominator}.</M> Dit kan als we boven en onder vermenigvuldigen met <M>{fraction2.denominator}.</M> Zo krijgen we <BM>{term2} = {term2Intermediate}.</BM> We kunnen de breuken vervolgens samenvoegen als <BM>{denominator} = {denominatorSplit} = {denominatorIntermediate}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => {
			const { variables, intermediate } = useSolution()
			return <>
				<Par>Herschrijf de samengestelde breuk <BM>{intermediate}</BM> als enkele breuk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{intermediate}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, expression, intermediate, ans } = useSolution()
			return <>
				<Par>We hebben een breuk die we delen door een breuk. Door de regel "delen door een breuk is vermenigvuldigen met het omgekeerde" kunnen we dit schrijven als <BM>{intermediate.numerator.multiplyBy(intermediate.denominator.invert())}.</BM> Als we deze breuken samenvoegen, dan kunnen we dit simplificeren tot <BM>{ans}.</BM> Eventueel kunnen de haakjes nog uitgewerkt worden, maar dat is niet per se nodig hier.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden deze opgave ook op kunnen lossen door de boven- en onderkant van de oorspronkelijke breuk met <M>{variables.x.multiplyBy(variables.y).simplify({ sortProducts: true })}</M> te vermenigvuldigen. Na het wegstrepen van factoren vinden we dan direct dat <BM>{expression}={ans.simplify({ expandProductsOfSums: true, sortProducts: true, mergeProductTerms: true, mergeSumNumbers: true })}.</BM> Deze short-cut vereist echter inzicht die je alleen via veel oefenen kan krijgen.</Par>
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