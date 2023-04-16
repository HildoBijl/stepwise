import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import ExpressionInput, { allMathSimpleVariables, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'

import { getInputFieldFeedback } from '../util/feedback'

const { onlyOrderChanges, equivalent, constantMultiple } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, f, g, h } = useSolution()
	return <>
		<Par>Gegeven is de functie <BM>h\left({x}\right) = {h}.</BM> Deze functie is het resultaat van de ketening <M>h\left({x}\right) = f\left(g\left({x}\right)\right),</M> waarbij <BMList><BMPart>f\left({x}\right) = {f},</BMPart><BMPart>g\left({x}\right) = {g}.</BMPart></BMList>Bepaal de afgeleide <M>h'\left({x}\right).</M></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} />
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
						<Substep ss={1}><ExpressionInput id="fDerivative" prelabel={<M>f'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} /></Substep>
						<Substep ss={2}><ExpressionInput id="gDerivative" prelabel={<M>g'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, fDerivative, gDerivative } = useSolution()
			return <Par>We kunnen in onze tabel van basisafgeleiden (samen met de constanteregel bij <M>f\left({x}\right)</M>) vinden dat
				<BMList>
					<BMPart>f'\left({x}\right) = {fDerivative},</BMPart>
					<BMPart>g'\left({x}\right) = {gDerivative}.</BMPart>
				</BMList>
			</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Stel via de kettingregel de afgeleide <M>h'\left({x}\right)</M> samen.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, g, gDerivative, derivative, derivativeSimplified } = useSolution()
			return <Par>De kettingregel zegt dat <BM>h'\left({x}\right) = f'\left(g\left({x}\right)\right) g'\left({x}\right).</BM> Als we dit letterlijk toepassen, dan vullen we <M>{g}</M> in de functie <M>f'\left({x}\right)</M> in, en vermenigvuldigen het resultaat met <M>{gDerivative}.</M> Zo vinden we <BM>h'\left({x}\right) = {derivative}.</BM> Dit kan eventueel nog herschreven worden tot <BM>h'\left({x}\right) = {derivativeSimplified}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define h derivative checks.
	const originalFunction = (input, correct, { h }) => onlyOrderChanges(input, h) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de kettingregel correct toegepast hebt.</>

	// Define fDerivative and gDerivative checks.
	const fDerivativeConstantMultipleCheck = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const fDerivativeIncorrectCheck = (input, correct, solution, isCorrect) => !isCorrect && <>Deze klopt niet. Kijk goed in je tabel van basisafgeleiden.</>

	// Assemble the checks for all input fields.
	const derivativeChecks = [originalFunction, incorrectFunction]
	const fDerivativeChecks = [fDerivativeConstantMultipleCheck, fDerivativeIncorrectCheck]
	const feedbackChecks = [derivativeChecks, fDerivativeChecks, fDerivativeChecks]

	// Determine feedback.
	return getInputFieldFeedback(['derivative', 'fDerivative', 'gDerivative'], exerciseData, feedbackChecks.map(feedbackChecks => ({ feedbackChecks })))
}
