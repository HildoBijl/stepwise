import React from 'react'

import { Integer, Sum, Product, Fraction, expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, sumWithWrongTermsNumber, wrongFirstTerm, wrongSecondTerm, wrongThirdTerm, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Haal de grootste gemeenschappelijke factor van de drie bovenstaande termen buiten haakjes.</Par>
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
			const { variables } = useSolution(state)
			return <>
				<Par>Bepaal de grootste gemeenschappelijke factor van de drie bovenstaande termen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="factor" prelabel="Grootste factor:" label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, expression, gcdValue, factor } = useSolution(state)
			return <>
				<Par>Als eerste kijken we naar de getallen. De grootste gemeenschappelijke factor van de getallen <M>{Math.abs(expression.terms[0].terms[0].number)}</M>, <M>{Math.abs(expression.terms[1].terms[0].number)}</M> en <M>{Math.abs(expression.terms[2].terms[0].number)}</M> is <M>{gcdValue}.</M> Deze factor moeten we dus zeker buiten haakjes gaan halen.</Par>
				<Par>Vervolgens moeten we ook naar de variabelen kijken. We zien dat alleen <M>{variables.x}</M> in alle termen voorkomt. Dit is dus ook een gemeenschappelijke factor die we buiten haakjes kunnen halen. Samengevat is de grootste gemeenschappelijke factor <M>{factor}.</M></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, expression, factor } = useSolution(state)
			return <>
				<Par>Als we bij een uitdrukking <M>\left[\ldots\right]</M> een factor <M>{factor}</M> buiten haakjes willen halen, dan willen we de uitdrukking schrijven als <BM>{factor} \cdot \frac(\left[\ldots\right])({factor}).</BM> Schrijf het bovenstaande dus eerst letterlijk op, met op de puntjes de gegeven uitdrukking.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="setup" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { setup } = useSolution(state)
			return <Par>We schrijven letterlijk op, <BM>{setup}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, fraction } = useSolution(state)
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
			const { variables, gcdValue, fractionSplit, fractionSimplified } = useSolution(state)
			return <Par>Als eerste splitsen we de breuk op. Zo krijgen we <BM>{fractionSplit}.</BM> Vervolgens strepen we bij alle breuken boven en onder de factoren <M>{gcdValue}</M> en <M>{variables.x}</M> weg. We blijven over met <BM>{fractionSimplified}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, expression, factor } = useSolution(state)
			return <>
				<Par>Vul de gesimplificeerde breuk in. Oftewel, schrijf de oorspronkelijke uitdrukking <M>{expression}</M> op als <M>{factor} \cdot \left(\ldots\right)</M> met op de puntjes het antwoord van de vorige stap.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { ans } = useSolution(state)
			return <>
				<Par>Als we letterlijk het resultaat van de vorige stap op de puntjes invullen, dan krijgen we <BM>{ans}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { variables, ans } = useSolution(state)
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
			const { expression, ans } = useSolution(state)
			return <>
				<Par>Als we de haakjes uitwerken, dan krijgen we <BM>{ans} = {expression}.</BM> Dit is hetzelfde als waar we mee begonnen, en dus klopt het wat we gedaan hebben.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const outsideBracketsForm = {
		check: (correct, input, { variables, gcdValue }) => !(input.isType(Product) && input.terms.length === 3 && input.terms.some(term => term.isNumeric() && term.number === gcdValue) && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => term.isType(Sum))),
		text: (correct, input, { factor }) => <>Je antwoord moet van de vorm <M>{factor} \cdot \left(\ldots\right)</M> zijn.</>,
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

	// Define factor checks.
	const noNumber = {
		check: (correct, input) => !(input.isType(Integer) || (input.isType(Product) && input.terms.some(term => term.isType(Integer)))), // It's not an integer nor contains one.
		text: <>Je antwoord bevat geen getal. De drie gegeven termen hebben echter wel een getal als gemeenschappelijke deler.</>
	}
	const noVariable = {
		check: (correct, input) => !input.isType(Product) || input.isNumeric(),
		text: <>Je antwoord is alleen een getal. De drie termen hebben echter ook iets met een variabele als gemeenschappelijke factor.</>,
	}
	const wrongNumber = {
		check: (correct, input, { gcdValue }) => (input.terms.find(term => term.isType(Integer)) || Integer.zero).number !== gcdValue,
		text: (correct, input, { variables }) => <>Het gegeven getal is niet de grootste gemeenschappelijke deler van <M>{Math.abs(variables.a*variables.b)}</M>, <M>{Math.abs(variables.a*variables.c)}</M> en <M>{Math.abs(variables.a*variables.d)}</M>.</>,
	}
	const superfluousVariable = {
		check: (correct, input, { variables }) => input.dependsOn(variables.y) || input.dependsOn(variables.z),
		text: (correct, input, { variables }) => <>Niet alle termen hangen af van <M>{input.dependsOn(variables.y) ? variables.y : variables.z}.</M> Dit is geen gedeelde factor.</>,
	}
	const missingVariable = {
		check: (correct, input, { variables }) => !input.dependsOn(variables.x),
		text: (correct, input, { variables }) => <>Merk op dat alle termen afhangen van <M>{variables.x}.</M> Dit ontbreekt echter in je antwoord.</>,
	}
	const factorChecks = [noNumber, noVariable, wrongNumber, superfluousVariable, missingVariable]

	// Define setup checks.
	const setupForm = {
		check: (correct, input, { variables, gcdValue }) => !(input.isType(Product) && input.terms.length === 3 && input.terms.some(term => term.isNumeric() && term.number === gcdValue) && input.terms.some(term => onlyOrderChanges(variables.x, term)) && input.terms.some(term => term.isType(Fraction))),
		text: (correct, input, { factor }) => <>Je antwoord moet van de vorm <M>{factor} \cdot \frac(\left[\ldots\right])({factor})</M> zijn.</>,
	}
	const fractionForm = {
		check: (correct, input, { factor }) => !(input.isType(Product) && input.terms.length === 3 && input.terms.some(term => term.isType(Fraction) && onlyOrderChanges(factor, term.denominator))),
		text: (correct, input, { factor }) => <>Je antwoord moet van de vorm <M>{factor} \cdot \frac(\left[\ldots\right])({factor})</M> zijn. Heb je wel een breuk met noemer <M>{factor}</M> ingevoerd?</>,
	}
	const correctNumerator = {
		check: (correct, input, { variables, expression }) => !(input.isType(Product) && input.terms.length === 3 && input.terms.some(term => term.isType(Fraction) && onlyOrderChanges(expression, term.numerator))),
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

	return getInputFieldFeedback(['ans', 'factor', 'setup', 'fractionSimplified', 'expression'], exerciseData, [ansChecks, factorChecks, setupChecks, fractionSimplifiedChecks, expressionChecks].map(feedbackChecks => ({ feedbackChecks })))
}