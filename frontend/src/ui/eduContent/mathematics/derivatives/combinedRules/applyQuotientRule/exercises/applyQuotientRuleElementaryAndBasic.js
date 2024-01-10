import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, Substep, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent, constantMultiple } = expressionComparisons
const { incorrectFraction } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, f, g, h } = useSolution()
	return <>
		<Par>Gegeven is de functie <BM>h\left({x}\right) = {h}.</BM> Deze functie is de deling van de twee functies <BMList><BMPart>f\left({x}\right) = {f},</BMPart><BMPart>g\left({x}\right) = {g}.</BMPart></BMList>Bepaal de afgeleide <M>h'\left({x}\right).</M></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Vind los de afgeleiden van de functies <M>f\left({x}\right)</M> en <M>g\left({x}\right).</M>
				</Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="fDerivative" prelabel={<M>f'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
						<Substep ss={2}><ExpressionInput id="gDerivative" prelabel={<M>g'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, fDerivative, gDerivative }) => {
			return <Par>Via de somregel en de constantenregel, en met wat herschrijven, vinden we
				<BM>f'\left({x}\right) = {fDerivative}.</BM>
				Verder zegt de tabel van basisafgeleiden direct dat
				<BM>g'\left({x}\right) = {gDerivative}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Stel via de quotiëntregel de afgeleide <M>h'\left({x}\right)</M> samen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, derivative, derivativeSimplified }) => {
			return <Par>De quotiëntregel zegt dat <BM>h'\left({x}\right) = \frac(g\left({x}\right) f'\left({x}\right) - f\left({x}\right) g'\left({x}\right))(\left(g\left({x}\right)\right)^2).</BM> Als we dit letterlijk toepassen, dan krijgen we <BM>h'\left({x}\right) = {derivative}.</BM> Dit kan eventueel nog herschreven worden tot <BM>h'\left({x}\right) = {derivativeSimplified}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define h derivative checks.
	const originalFunction = (input, correct, { h }) => onlyOrderChanges(input, h) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de quotiëntregel correct toegepast hebt.</>

	// Define fDerivative and gDerivative checks.
	const fDerivativeConstantMultipleCheck = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const fDerivativeIncorrectCheck = (input, correct, solution, isCorrect) => !isCorrect && <>Deze klopt niet. Kijk goed in je tabel van basisafgeleiden.</>

	// Assemble the checks for all input fields.
	const derivativeChecks = [originalFunction, incorrectFraction, incorrectFunction]
	const fDerivativeChecks = [fDerivativeConstantMultipleCheck, fDerivativeIncorrectCheck]
	const feedbackChecks = [derivativeChecks, fDerivativeChecks, fDerivativeChecks]

	// Determine feedback.
	return getFieldInputFeedback(['derivative', 'fDerivative', 'gDerivative'], exerciseData, feedbackChecks.map(feedbackChecks => ({ feedbackChecks })))
}
