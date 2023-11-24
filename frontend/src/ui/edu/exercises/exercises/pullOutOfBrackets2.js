import React from 'react'

import { Integer, Sum, Product, Fraction, expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'

import { useSolution } from 'ui/eduTools'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, sumWithUnsimplifiedTerms, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Haal de grootste gemeenschappelijke factor van de drie bovenstaande termen buiten haakjes.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Bepaal de grootste gemeenschappelijke factor van de drie bovenstaande termen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="factor" prelabel="Grootste factor:" label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, expression, gcdValue, factor } = useSolution()
			return <>
				<Par>Als eerste kijken we naar de getallen. De grootste gemeenschappelijke factor van de getallen <M>{Math.abs(expression.terms[0].terms[0].number)}</M>, <M>{Math.abs(expression.terms[1].terms[0].number)}</M> en <M>{Math.abs(expression.terms[2].terms[0].number)}</M> is <M>{gcdValue}.</M> Deze factor moeten we dus zeker buiten haakjes gaan halen.</Par>
				<Par>Vervolgens moeten we ook naar de variabelen kijken. We zien dat alleen <M>{variables.x}</M> in alle termen voorkomt. Dit is dus ook een gemeenschappelijke factor die we buiten haakjes kunnen halen. Samengevat is de grootste gemeenschappelijke factor <M>{factor}.</M></Par>
			</>
		},
	},
	{
		Problem: () => {
			const { variables, expression, factor } = useSolution()
			return <>
				<Par>Als we bij een uitdrukking <M>\left[\ldots\right]</M> een factor <M>{factor}</M> buiten haakjes willen halen, dan willen we de uitdrukking schrijven als <BM>{factor} \cdot \frac(\left[\ldots\right])({factor}).</BM> Schrijf het bovenstaande dus eerst letterlijk op, met op de puntjes de gegeven uitdrukking.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="setup" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { setup } = useSolution()
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
						<ExpressionInput id="fractionSimplified" prelabel={<M>{fraction}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, gcdValue, fractionSplit, fractionSimplified } = useSolution()
			return <Par>Als eerste splitsen we de breuk op. Zo krijgen we <BM>{fractionSplit}.</BM> Vervolgens strepen we bij alle breuken boven en onder de factoren <M>{gcdValue}</M> en <M>{variables.x}</M> weg. We blijven over met <BM>{fractionSimplified}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression, factor } = useSolution()
			return <>
				<Par>Vul de gesimplificeerde breuk in. Oftewel, schrijf de oorspronkelijke uitdrukking <M>{expression}</M> op als <M>{factor} \cdot \left(\ldots\right)</M> met op de puntjes het antwoord van de vorige stap.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { ans } = useSolution()
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
						<ExpressionInput id="expression" prelabel={<M>{ans}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { expression, ans } = useSolution()
			return <>
				<Par>Als we de haakjes uitwerken, dan krijgen we <BM>{ans} = {expression}.</BM> Dit is hetzelfde als waar we mee begonnen, en dus klopt het wat we gedaan hebben.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const outsideBracketsForm = (input, correct, { variables, gcdValue, factor }) => !(input.isSubtype(Product) && input.terms.length === 3 && input.terms.some(term => term.isNumeric() && term.number === gcdValue) && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => term.isSubtype(Sum))) && <>Je antwoord moet van de vorm <M>{factor} \cdot \left(\ldots\right)</M> zijn.</>

	const incorrectExpansion = (input, correct) => !equivalent(input, correct) && <>Als je de haakjes uitwerkt kom je niet uit op waar je mee begonnen bent. Er is dus iets misgegaan bij het omschrijven.</>

	const correctExpansion = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <>Dit klopt wel, maar het kan nog simpeler geschreven worden.</>

	const ansChecks = [
		outsideBracketsForm,
		incorrectExpansion,
		correctExpansion,
	]

	// Define factor checks.
	const noNumber = (input) => !input.recursiveSome(term => term.isSubtype(Integer)) && <>Je antwoord bevat geen getal. De drie gegeven termen hebben echter wel een getal als gemeenschappelijke deler.</>

	const noVariable = (input) => input.isNumeric() && <>Je antwoord is alleen een getal. De drie termen hebben echter ook iets met een variabele als gemeenschappelijke factor.</>

	const wrongNumber = (input, correct, { variables, gcdValue }) => {
		const givenNumber = input.terms.find(term => term.isSubtype(Integer))
		if (givenNumber && givenNumber.number !== gcdValue)
			return <>Je hebt <M>{givenNumber}</M> als getal ingevuld, maar dit is niet de grootste gemeenschappelijke deler van de getallen <M>{Math.abs(variables.a * variables.b)}</M>, <M>{Math.abs(variables.a * variables.c)}</M> en <M>{Math.abs(variables.a * variables.d)}</M>.</>
	}

	const missingVariable = (input, correct, { variables }) => !input.dependsOn(variables.x) && <>Merk op dat alle termen afhangen van <M>{variables.x}.</M> Dit ontbreekt echter in je antwoord.</>

	const superfluousVariable = (input, correct, { variables }) => {
		const extraVariable = ['y', 'z'].find(variable => input.dependsOn(variables[variable]))
		if (extraVariable)
			return <>Niet alle termen hangen af van <M>{variables[extraVariable]}.</M> Dit is geen gedeelde factor.</>
	}

	const factorChecks = [
		noNumber,
		noVariable,
		wrongNumber,
		missingVariable,
		superfluousVariable,
	]

	// Define setup checks.
	const setupForm = (input, correct, { variables, factor, gcdValue }) => !(input.isSubtype(Product) && input.terms.length === 3 && input.terms.some(term => term.isNumeric() && term.number === gcdValue) && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => term.isSubtype(Fraction))) && <>Je antwoord moet van de vorm <M>{factor} \cdot \frac(\left[\ldots\right])({factor})</M> zijn.</>

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

	return getInputFieldFeedback(['ans', 'factor', 'setup', 'fractionSimplified', 'expression'], exerciseData, [ansChecks, factorChecks, setupChecks, fractionSimplifiedChecks, expressionComparisons].map(feedbackChecks => ({ feedbackChecks })))
}