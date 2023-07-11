import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noSum, sumWithWrongTerms, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Splits deze breuk op in twee losse breuken en simplificeer deze zo veel mogelijk.</Par>
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
			const { plus, variables, expression } = useSolution()
			return <>
				<Par>Splits de breuk op in twee losse breuken met een {plus ? 'plus' : 'min'}teken ertussen. (Pas nog geen verdere simplificaties toe.)</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="split" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { plus, expression, leftExpression, rightExpression } = useSolution()
			return <Par>Als we een breuk opsplitsen, dan blijft de noemer (de onderkant) hetzelfde bij beide breuken. Alleen de teller (de bovenkant) wordt opgeplitst. Zo vinden we <BM>{expression} = {leftExpression} {plus ? '+' : '-'} {rightExpression}.</BM> Hiermee is de breuk opgeplitst in twee breuken die we nog verder kunnen simplificeren.</Par>
		},
	},
	{
		Problem: () => {
			const { variables, leftExpression, rightExpression } = useSolution()
			return <>
				<Par>Simplificeer de beide breuken zo veel mogelijk. Streep hiervoor factoren weg die in zowel de teller als de noemer voorkomen.</Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="leftAns" prelabel={<M>{leftExpression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} /></Substep>
						<Substep ss={2}><ExpressionInput id="rightAns" prelabel={<M>{rightExpression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, leftExpression, rightExpression, leftAns, rightAns } = useSolution()
			return <Par>Bij de eerste breuk kunnen we boven en onder <M>{variables.y}</M> wegdelen. Zo vinden we <BM>{leftExpression} = {leftAns}.</BM> Voor de tweede breuk delen we boven en onder <M>{variables.x}</M> weg. Hiermee krijgen we <BM>{rightExpression} = {rightAns}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { plus, variables, expression } = useSolution()
			return <>
				<Par>Schrijf de twee gesimplificeerde breuken samen op in één uitdrukking, met uiteraard wederom een {plus ? 'plus' : 'min'}teken ertussen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { plus, expression, leftExpression, rightExpression, ans } = useSolution()
			return <Par>Het eindresultaat van de twee breuken samen is <BM>{expression} = {leftExpression} {plus ? '+' : '-'} {rightExpression} = {ans}.</BM> Dit is zo simpel als we deze breuken kunnen schrijven.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const nonsimplifiedTerms = (input, correct) => {
		const unsimplifiedTerm = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => onlyOrderChanges(inputTerm, correctTerm)))
		if (unsimplifiedTerm !== -1)
			return [
				<>De eerste term van je antwoord kan nog verder gesimplificeerd worden.</>,
				<>De tweede term van je antwoord kan nog verder gesimplificeerd worden.</>,
			][unsimplifiedTerm]
	}

	// Define fraction checks.
	const correctFraction = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <>De breuk klopt, maar je kunt hem nog makkelijker schrijven.</>

	const incorrectFraction = (input, correct) => !equivalent(input, correct) && <>De breuk is niet gelijk aan wat gegeven was. Je hebt iets gedaan dat niet mag.</>

	// Assemble the checks for all input fields.
	const ansChecks = [
		originalExpression,
		noSum,
		sumWithWrongTerms,
		nonsimplifiedTerms,
		correctExpression,
		incorrectExpression,
	]
	const splitChecks = [
		originalExpression,
		noSum,
		sumWithWrongTerms,
		correctExpression,
		incorrectExpression,
	]
	const fractionChecks = [
		noFraction,
		hasFractionWithinFraction,
		correctFraction,
		incorrectFraction,
	]

	// Determine feedback.
	return getInputFieldFeedback(['ans', 'split', 'leftAns', 'rightAns'], exerciseData, [ansChecks, splitChecks, fractionChecks, fractionChecks].map(feedbackChecks => ({ feedbackChecks })))
}