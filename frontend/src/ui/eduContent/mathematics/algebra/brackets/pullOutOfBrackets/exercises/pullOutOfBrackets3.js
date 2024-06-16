import React from 'react'

import { Sum, Product, Fraction, expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { originalExpression, sumWithUnsimplifiedTerms, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression, factor } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Haal de factor <M>{factor}</M> buiten haakjes.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables, expression, factor } = useSolution()
			return <>
				<Par>Als we bij een uitdrukking <M>\left[\ldots\right]</M> een factor <M>{factor}</M> buiten haakjes willen halen, dan willen we de uitdrukking schrijven als <BM>{factor} \cdot \frac(\left[\ldots\right])({factor}).</BM> Schrijf het bovenstaande dus eerst letterlijk op, met op de puntjes de gegeven uitdrukking.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="setup" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ setup }) => {
			return <Par>We schrijven letterlijk op, <BM>{setup}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, fraction } = useSolution()
			return <>
				<Par>Splits de resulterende breuk <BM>{fraction}</BM> op in losse breuken en simplificeer deze zo veel mogelijk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="fractionSimplified" prelabel={<M>{fraction}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, fractionSplit, fractionSimplified }) => {
			return <Par>Als eerste splitsen we de breuk op. Zo krijgen we <BM>{fractionSplit}.</BM> Vervolgens strepen we bij alle breuken de variabelen <M>{variables.x}</M> en <M>{variables.y}</M> boven en onder weg. We blijven over met <BM>{fractionSimplified}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression, factor } = useSolution()
			return <>
				<Par>Vul de gesimplificeerde breuk in. Oftewel, schrijf de oorspronkelijke uitdrukking <M>{expression}</M> op als <M>{factor} \cdot \left(\ldots\right)</M> met op de puntjes het antwoord van de vorige stap.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ ans }) => {
			return <>
				<Par>Als we letterlijk het resultaat van de vorige stap op de puntjes invullen, dan krijgen we <BM>{ans}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => {
			const { variables, ans } = useSolution()
			return <>
				<Par>Controleer je antwoord: wat krijg je als je de haakjes uitwerkt en alles weer simplificeert?</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="expression" prelabel={<M>{ans}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ expression, ans }) => {
			return <>
				<Par>Als we de haakjes uitwerken, dan krijgen we <BM>{ans} = {expression}.</BM> Dit is hetzelfde als waar we mee begonnen, en dus klopt het wat we gedaan hebben.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const outsideBracketsForm = (input, correct, { variables, factor }) => !(input.isSubtype(Product) && input.terms.length === 3 && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => onlyOrderChanges(variables.y, term)) && input.terms.some(term => term.isSubtype(Sum))) && <>Je antwoord moet van de vorm <M>{factor} \cdot \left(\ldots\right)</M> zijn.</>

	const incorrectExpansion = (input, correct) => !equivalent(input, correct) && <>Als je de haakjes uitwerkt kom je niet uit op waar je mee begonnen bent. Er is dus iets misgegaan bij het omschrijven.</>

	const correctExpansion = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <>Dit klopt wel, maar het kan nog simpeler geschreven worden.</>

	const ansChecks = [
		outsideBracketsForm,
		incorrectExpansion,
		correctExpansion,
	]

	// Define setup checks.
	const setupForm = (input, correct, { variables, factor, gcdValue }) => !(input.isSubtype(Product) && input.terms.length === 3 && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => onlyOrderChanges(variables.y, term)) && input.terms.some(term => term.isSubtype(Fraction))) && <>Je antwoord moet van de vorm <M>{factor} \cdot \frac(\left[\ldots\right])({factor})</M> zijn.</>

	const fractionForm = (input, correct, { variables, factor }) => !(input.isSubtype(Product) && input.terms.length === 3 && input.terms.some(term => term.isSubtype(Fraction) && onlyOrderChanges(factor, term.denominator))) && <>Je antwoord moet van de vorm <M>{factor} \cdot \frac(\left[\ldots\right])({factor})</M> zijn. Heb je wel een breuk met noemer <M>{factor}</M> ingevoerd?</>

	const correctNumerator = (input, correct, { expression }) => !(input.isSubtype(Product) && input.terms.length === 3 && input.terms.some(term => term.isSubtype(Fraction) && onlyOrderChanges(expression, term.numerator))) && <>Zorg dat je bovenin de breuk letterlijk de uitdrukking <M>{expression}</M> invoert.</>

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
		sumWithUnsimplifiedTerms,
		incorrectExpression,
		correctExpression,
	]

	// Define expression checks.
	const expressionComparisons = [
		sumWithUnsimplifiedTerms,
		incorrectExpression,
		correctExpression,
	]

	return getFieldInputFeedback(exerciseData, { ans: ansChecks, setup: setupChecks, fractionSimplified: fractionSimplifiedChecks, expression: expressionComparisons })
}
