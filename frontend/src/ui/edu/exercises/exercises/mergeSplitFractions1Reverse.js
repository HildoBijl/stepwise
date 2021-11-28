import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noSum, sumWithWrongTermsNumber, wrongFirstTerm, wrongSecondTerm, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Splits deze breuk op in twee losse breuken en simplificeer deze zo veel mogelijk.</Par>
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
			const { plus, variables, expression } = useSolution(state)
			return <>
				<Par>Splits de breuk op in twee losse breuken met een {plus ? 'plus' : 'min'}teken ertussen. (Pas nog geen verdere simplificaties toe.)</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="split" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { plus, expression, leftExpression, rightExpression } = useSolution(state)
			return <Par>Als we een breuk opsplitsen, dan blijft de noemer (de onderkant) hetzelfde bij beide breuken. Alleen de teller (de bovenkant) wordt opgeplitst. Zo vinden we <BM>{expression} = {leftExpression} {plus ? '+' : '-'} {rightExpression}.</BM> Hiermee is de breuk opgeplitst in twee breuken die we nog verder kunnen simplificeren.</Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, leftExpression, rightExpression } = useSolution(state)
			return <>
				<Par>Simplificeer de beide breuken zo veel mogelijk. Streep hiervoor factoren weg die in zowel de teller als de noemer voorkomen.</Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="leftAns" prelabel={<M>{leftExpression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} /></Substep>
						<Substep ss={2}><ExpressionInput id="rightAns" prelabel={<M>{rightExpression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { leftExpression, rightExpression, leftAns, rightAns } = useSolution(state)
			return <Par>Bij de eerste breuk kunnen we boven en onder <M>{leftExpression.numerator}</M> wegdelen. Zo vinden we <BM>{leftExpression} = {leftAns}.</BM> Voor de tweede breuk delen we boven en onder <M>{rightExpression.numerator}</M> weg. Hiermee krijgen we <BM>{rightExpression} = {rightAns}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { plus, variables, expression } = useSolution(state)
			return <>
				<Par>Schrijf de twee gesimplificeerde breuken samen op in één uitdrukking, met uiteraard wederom een {plus ? 'plus' : 'min'}teken ertussen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { plus, expression, leftExpression, rightExpression, ans } = useSolution(state)
			return <Par>Het eindresultaat van de twee breuken samen is <BM>{expression} = {leftExpression} {plus ? '+' : '-'} {rightExpression} = {ans}.</BM> Dit is zo simpel als we deze breuken kunnen schrijven.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const nonsimplifiedFirstTerm = {
		check: (correct, input) => !correct.terms.some(term => onlyOrderChanges(term, input.terms[0])),
		text: <>De eerste term van je antwoord kan nog verder gesimplificeerd worden.</>,
	}
	const nonsimplifiedSecondTerm = {
		check: (correct, input) => !correct.terms.some(term => onlyOrderChanges(term, input.terms[1])),
		text: <>De tweede term van je antwoord kan nog verder gesimplificeerd worden.</>,
	}

	// Define fraction checks.
	const correctFraction = {
		check: equivalent,
		text: (correct, input) => <>De breuk klopt, maar je kunt hem nog makkelijker schrijven.</>,
	}
	const incorrectFraction = {
		check: (correct, input) => !equivalent(correct, input),
		text: (correct, input) => <>De breuk is niet gelijk aan wat gegeven was. Je hebt iets gedaan dat niet mag.</>,
	}

	// Assemble the checks for all input fields.
	const ansChecks = [
		originalExpression,
		noSum,
		sumWithWrongTermsNumber,
		wrongFirstTerm,
		wrongSecondTerm,
		nonsimplifiedFirstTerm,
		nonsimplifiedSecondTerm,
		correctExpression,
		incorrectExpression,
	]
	const splitChecks = [
		originalExpression,
		noSum,
		sumWithWrongTermsNumber,
		wrongFirstTerm,
		wrongSecondTerm,
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