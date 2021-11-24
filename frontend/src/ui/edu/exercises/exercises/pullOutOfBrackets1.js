import React from 'react'

import { Sum, Product, Fraction, expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, sumWithWrongTermsNumber, wrongFirstTerm, wrongSecondTerm, wrongThirdTerm, correctExpression, incorrectExpression } from '../util/feedbackChecks'

const { onlyOrderChanges, equivalent } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useCorrect(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Haal de factor <M>{variables.x}</M> buiten haakjes.</Par>
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
			const { variables, expression } = useCorrect(state)
			return <>
				<Par>Als we bij een uitdrukking <M>\left[\ldots\right]</M> een factor <M>{variables.x}</M> buiten haakjes willen halen, dan willen we de uitdrukking schrijven als <BM>{variables.x} \cdot \frac(\left[\ldots\right])({variables.x}).</BM> Schrijf dit dus eerst letterlijk op, met op de puntjes de gegeven uitdrukking.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="setup" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { setup } = useCorrect(state)
			return <Par>We schrijven letterlijk op, <BM>{setup}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, fraction } = useCorrect(state)
			return <>
				<Par>Splits de resulterende breuk <BM>{fraction}</BM> op in losse breuken en simplificeer deze zo veel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="fractionSimplified" prelabel={<M>{fraction}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, fractionSplit, fractionSimplified } = useCorrect(state)
			return <Par>Als eerste splitsen we de breuk op. Zo krijgen we <BM>{fractionSplit}.</BM> Vervolgens strepen we, waar mogelijk, boven en onder een factor <M>{variables.x}</M> weg. Op één plek is dit niet mogelijk, en daar moeten we de breuk dus laten staan. Zo vinden we <BM>{fractionSimplified}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, expression } = useCorrect(state)
			return <>
				<Par>Vul de gesimplificeerde breuk in. Oftewel, schrijf de oorspronkelijke uitdrukking <M>{expression}</M> op als <M>{variables.x} \cdot \left(\ldots\right)</M> met op de puntjes het antwoord van de vorige stap.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { ans } = useCorrect(state)
			return <>
				<Par>Als we letterlijk het resultaat van de vorige stap op de puntjes invullen, dan krijgen we <BM>{ans}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, ans } = useCorrect(state)
			return <>
				<Par>Controleer je antwoord: wat krijg je als je de haakjes uitwerkt en alles weer simplificeert?</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="expression" prelabel={<M>{ans}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { expression, ans } = useCorrect(state)
			return <>
				<Par>Als we de haakjes uitwerken, dan krijgen we <BM>{ans} = {expression}.</BM> Dit is hetzelfde als waar we mee begonnen, en dus klopt het wat we gedaan hebben.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const outsideBracketsForm = {
		check: (correct, input, { variables }) => !(input.isType(Product) && input.terms.length === 2 && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => term.isType(Sum))),
		text: (correct, input, { variables }) => <>Je antwoord moet van de vorm <M>{variables.x} \cdot \left(\ldots\right)</M> zijn.</>,
	}
	const incorrectExpansion = {
		check: (correct, input) => !equivalent(correct, input),
		text: <>Als je de haakjes uitwerkt kom je niet uit op waar je mee begonnen bent. Er is dus iets misgegaan bij het omschrijven.</>,
	}
	const correctExpansion = {
		check: (correct, input) => true,
		text: <>Dit klopt wel, maar het kan nog simpeler geschreven worden.</>,
	}
	const ansChecks = [
		outsideBracketsForm,
		incorrectExpansion,
		correctExpansion,
	]

	// Define setup checks.
	const setupForm = {
		check: (correct, input, { variables }) => !(input.isType(Product) && input.terms.length === 2 && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => term.isType(Fraction))),
		text: (correct, input, { variables }) => <>Je antwoord moet van de vorm <M>{variables.x} \cdot \frac(\left[\ldots\right])({variables.x})</M> zijn.</>,
	}
	const fractionForm = {
		check: (correct, input, { variables }) => !(input.isType(Product) && input.terms.length === 2 && input.terms.some(term => term.isType(Fraction) && onlyOrderChanges(variables.x, term.denominator))),
		text: (correct, input, { variables }) => <>Je antwoord moet van de vorm <M>{variables.x} \cdot \frac(\left[\ldots\right])({variables.x})</M> zijn. Heb je wel een breuk met noemer <M>{variables.x}</M> ingevoerd?</>,
	}
	const correctNumerator = {
		check: (correct, input, { variables, expression }) => !(input.isType(Product) && input.terms.length === 2 && input.terms.some(term => term.isType(Fraction) && onlyOrderChanges(expression, term.numerator))),
		text: (correct, input, { expression }) => <>Zorg dat je bovenin de breuk letterlijk de uitdrukking <M>{expression}</M> invoert.</>,
	}
	const setupChecks = [
		setupForm,
		fractionForm,
		correctNumerator,
		incorrectExpression,
		correctExpression,
	]

	// Define fraction simplification checks.
	const fractionSimplifiedChecks = [
		originalExpression,
		sumWithWrongTermsNumber,
		wrongFirstTerm,
		wrongSecondTerm,
		wrongThirdTerm,
		incorrectExpression,
		correctExpression,
	]

	// Define expression checks.
	const expressionChecks = [
		originalExpression,
		sumWithWrongTermsNumber,
		wrongFirstTerm,
		wrongSecondTerm,
		wrongThirdTerm,
		incorrectExpression,
		correctExpression,
	]

	return getInputFieldFeedback(['ans', 'setup', 'fractionSimplified', 'expression'], exerciseData, [ansChecks, setupChecks, fractionSimplifiedChecks, expressionChecks].map(feedbackChecks => ({ feedbackChecks })))
}