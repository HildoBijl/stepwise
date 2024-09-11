import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, Substep, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent, integerMultiple, constantMultiple } = expressionComparisons
const { originalExpression, noFraction, hasFractionWithinFraction, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Schrijf dit als één breuk. Simplificeer je antwoord zo veel mogelijk.</Par>
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
			const { variables, leftExpression, rightExpression } = useSolution()
			return <>
				<Par>Vind de <strong>kleinst mogelijke veelvoud</strong> van de twee noemers <M>{leftExpression.denominator}</M> en <M>{rightExpression.denominator}</M>.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="denominator" prelabel="Kleinste veelvoud:" label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ leftExpression, rightExpression, denominator }) => {
			return <Par>De noemers <M>{leftExpression.denominator}</M> en <M>{rightExpression.denominator}</M> hebben geen gemeenschappelijke factoren. We kunnen ze dus vermenigvuldigen om hun (kleinst mogelijke) gemeenschappelijke veelvoud te vinden. Zo krijgen we <BM>{denominator}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, leftExpression, rightExpression, denominator } = useSolution()
			return <>
				<Par>Herschrijf de beide breuken zodat ze <M>{denominator}</M> als noemer hebben.</Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="leftAns" prelabel={<M>{leftExpression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} /></Substep>
						<Substep ss={2}><ExpressionInput id="rightAns" prelabel={<M>{rightExpression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ leftExpression, rightExpression, leftAns, rightAns }) => {
			return <Par>Bij de eerste breuk vermenigvuldigen we boven en onder met <M>{rightExpression.denominator}.</M> Zo vinden we <BM>{leftExpression} = {leftAns}.</BM> Voor de tweede breuk vermenigvuldigen we boven en onder met <M>{leftExpression.denominator}.</M> Hiermee krijgen we <BM>{rightExpression} = {rightAns}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables, expression } = useSolution()
			return <>
				<Par>Voeg de twee herschreven breuken samen tot één breuk.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.rational} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ plus, expression, leftAns, rightAns, ans }) => {
			return <Par>Als we alles bij elkaar voegen, dan vinden we <BM>{expression} = {leftAns} {plus ? '+' : '-'} {rightAns} = {ans}.</BM> Hiermee zijn de twee breuken samengevoegd als één breuk.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define ans checks.
	const ansEquivalent = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <>Dit klopt wel, maar je kunt het nog simpeler schrijven.</>

	const denominatorCorrect = (input, correct, solution, isCorrect) => !isCorrect && onlyOrderChanges(correct.denominator, input.denominator) && <>De noemer klopt. Er gaat iets mis in de teller van je breuk.</>

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
		nonEquivalentExpression,
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
		equivalentExpression,
		nonEquivalentExpression,
	]

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: ansChecks, denominator: denominatorChecks, leftAns: fractionChecks, rightAns: fractionChecks })
}
