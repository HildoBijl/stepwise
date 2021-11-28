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
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent, integerMultiple, constantMultiple } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Schrijf dit als één breuk. Simplificeer je antwoord zo veel mogelijk.</Par>
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
			const { variables, leftExpression, rightExpression } = useSolution(state)
			return <>
				<Par>Vind de <strong>kleinst mogelijke veelvoud</strong> van de twee noemers <M>{leftExpression.denominator}</M> en <M>{rightExpression.denominator}</M>.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="denominator" prelabel="Kleinste veelvoud:" label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { a, b, variables, scmValue, leftExpression, rightExpression, denominator } = useSolution(state)
			return <Par>Vanwege <M>{leftExpression.denominator}</M> hebben we een factor <M>{variables.x}</M> nodig, en vanwege <M>{rightExpression.denominator}</M> hebben we een factor <M>{variables.y}</M> nodig. Verder is ook nog een factor <M>{scmValue}</M> nodig. Immers, dit is de kleinste veelvoud van <M>{a}</M> en van <M>{b}.</M> Zo vinden we dus <BM>{denominator}.</BM> Dit is de kleinste veelvoud van zowel <M>{leftExpression.denominator}</M> als <M>{rightExpression.denominator}.</M></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, leftExpression, rightExpression, denominator } = useSolution(state)
			return <>
				<Par>Herschrijf de beide breuken zodat ze <M>{denominator}</M> als noemer hebben.</Par>
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
			return <Par>Bij de eerste breuk vermenigvuldigen we boven en onder met <M>{leftAns.numerator}.</M> Zo vinden we <BM>{leftExpression} = {leftAns}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{rightAns.numerator}.</M> Hiermee krijgen we <BM>{rightExpression} = {rightAns}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables, expression } = useSolution(state)
			return <>
				<Par>Voeg de twee herschreven breuken samen tot één breuk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { plus, expression, leftAns, rightAns, ans } = useSolution(state)
			return <Par>Als we alles bij elkaar voegen, dan vinden we <BM>{expression} = {leftAns} {plus ? '+' : '-'} {rightAns} = {ans}.</BM> Hiermee zijn de twee breuken samengevoegd als één breuk.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const ansEquivalent = (input, correct) => equivalent(input, correct) && <>Dit klopt wel, maar je kunt het nog simpeler schrijven.</>

	const denominatorCorrect = (input, correct) => onlyOrderChanges(correct.denominator, input.denominator) && <>De noemer klopt. Er gaat iets mis in de teller van je breuk.</>

	// Define denominator checks.
	const denominatorEquivalent = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <>Technisch correct, maar je kan dit nog makkelijker schrijven.</>

	const denominatorNotSmallestMultiple = (input, correct, solution, isCorrect) => !isCorrect && integerMultiple(input, correct) && <>Dit is wel een veelvoud van de twee noemers, maar niet de <strong>kleinste</strong> veelvoud.</>

	const denominatorWrongFactor = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>De variabelen kloppen, maar er gaat iets mis met het getal dat je ingevoerd hebt.</>

	const denominatorMissingDependency = (input, correct, { variables }) => {
		const missingDependency = ['x', 'y'].find(variable => !input.dependsOn(variables[variable]))
		if (missingDependency)
			return <>Er zit helemaal geen <M>{variables[missingDependency]}</M> in je antwoord!</>
	}

	// Define fraction checks.
	const wrongDenominator = (input, correct) => !onlyOrderChanges(correct.denominator, input.denominator) && <>Je breuk heeft niet de beoogde noemer <M>{correct.denominator}.</M></>

	const wrongNumerator = (input, correct) => !equivalent(correct.numerator, input.numerator) && <>De noemer klopt, maar er gaat iets mis in de teller van je breuk.</>

	const nonsimplifiedNumerator = (input, correct) => !onlyOrderChanges(correct.numerator, input.numerator) && <>Je kunt de teller van je breuk nog makkelijker schrijven.</>

	// Assemble the checks for all input fields.
	const ansChecks = [
		originalExpression,
		noFraction,
		ansEquivalent,
		denominatorCorrect,
		incorrectExpression,
	]
	const denominatorChecks = [
		denominatorEquivalent,
		denominatorNotSmallestMultiple,
		denominatorWrongFactor,
		denominatorMissingDependency,
	]
	const fractionChecks = [
		originalExpression,
		noFraction,
		wrongDenominator,
		wrongNumerator,
		hasFractionWithinFraction,
		nonsimplifiedNumerator,
		correctExpression,
		incorrectExpression,
	]

	// Determine feedback.
	return getInputFieldFeedback(['ans', 'denominator', 'leftAns', 'rightAns'], exerciseData, [ansChecks, denominatorChecks, fractionChecks, fractionChecks].map(feedbackChecks => ({ feedbackChecks })))
}