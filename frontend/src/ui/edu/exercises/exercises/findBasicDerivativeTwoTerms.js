import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'

import { getInputFieldFeedback } from '../util/feedback'
import { sumWithWrongTerms } from '../util/feedbackChecks/expression'

const { onlyOrderChanges, equivalent } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, f, func } = useSolution()
	return <>
		<Par>Gegeven is de functie <BM>{f}\left({x}\right) = {func}.</BM> Bepaal de afgeleide <M>{f}'\left({x}\right).</M></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="derivative" prelabel={<M>{f}'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { f, x, c1, c2 } = useSolution()
			return <>
				<Par>De functie <M>{f}\left({x}\right)</M> kan ook geschreven worden als <BM>{f}\left({x}\right) = {c1.number === 1 ? '' : c1.number === -1 ? '-' : c1} {f}_1\left({x}\right) {c2.number > 0 ? '+' : ''} {c2.number === 1 ? '' : c2.number === -1 ? '-' : c2} {f}_2\left({x}\right)</BM> voor bepaalde basisfuncties <M>{f}_1\left({x}\right)</M> en <M>{f}_2\left({x}\right).</M> Bepaal deze basisfuncties.</Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="f1" prelabel={<M>{f}_1\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
						<Substep ss={2}><ExpressionInput id="f2" prelabel={<M>{f}_2\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { f, x, func, c1, c2, f1, f2 } = useSolution()
			return <Par>Voor de functies <M>{f}_1\left({x}\right) = {f1}</M> en <M>{f}_2\left({x}\right) = {f2}</M> geldt dat <BM>{f}\left({x}\right) = {func} = {c1.number === 1 ? '' : c1.number === -1 ? '-' : c1} {f}_1\left({x}\right) {c2.number > 0 ? '+' : ''} {c2.number === 1 ? '' : c2.number === -1 ? '-' : c2} {f}_2\left({x}\right).</BM></Par>
		},
	},
	{
		Problem: () => {
			const { f, x } = useSolution()
			return <>
				<Par>Vind los de afgeleiden van de basisfuncties <M>{f}_1\left({x}\right)</M> en <M>{f}_2\left({x}\right).</M>
				</Par>
				<InputSpace>
					<Par>
						<Substep ss={1}><ExpressionInput id="f1Derivative" prelabel={<M>{f}_1'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
						<Substep ss={2}><ExpressionInput id="f2Derivative" prelabel={<M>{f}_2'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { f, x, f1Derivative, f2Derivative } = useSolution()
			return <Par>We kunnen in onze tabel van basisafgeleiden direct opzoeken dat
				<BMList>
					<BMPart>{f}_1'\left({x}\right) = {f1Derivative},</BMPart>
					<BMPart>{f}_2'\left({x}\right) = {f2Derivative}.</BMPart>
				</BMList>
			</Par>
		},
	},
	{
		Problem: () => {
			const { f, x, c1, c2 } = useSolution()
			return <>
				<Par>Stel de afgeleide <M>{f}'\left({x}\right)</M> samen, gebruik makend van de somregel en de constanteregel via <BM>{f}'\left({x}\right) = {c1.number === 1 ? '' : c1.number === -1 ? '-' : c1} {f}_1'\left({x}\right) {c2.number > 0 ? '+' : ''} {c2.number === 1 ? '' : c2.number === -1 ? '-' : c2} {f}_2'\left({x}\right).</BM></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>{f}'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { f, x, c1, c2, f1Derivative, f2Derivative, derivative } = useSolution()
			return <Par>Het letterlijk toepassen van de regel geeft <BM>{f}'\left({x}\right) = {c1.number === 1 ? '' : c1.number === -1 ? '-' : c1} \left({f1Derivative}\right) {c2.number > 0 ? '+' : ''} {c2.number === 1 ? '' : c2.number === -1 ? '-' : c2} \left({f2Derivative}\right).</BM> Dit kan eventueel nog herschreven worden tot <BM>{f}'\left({x}\right) = {derivative}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Define derivative checks.
	const originalFunction = (input, correct, { func }) => onlyOrderChanges(input, func) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de juiste regels toegepast hebt.</>

	// Define f1 and f2 checks.
	const fIncorrectCheck = (index) => ((input, correct, { f, x }, isCorrect) => !isCorrect && <>Nee. Kijk goed naar waar je <M>{f}_{index}\left({x}\right)</M> voor moet vervangen zodat je op de oorspronkelijke functie uitkomt.</>)

	// Define f1Derivative and f2Derivative checks.
	const fDerivativeIncorrectCheck = (input, correct, { f, x }, isCorrect) => !isCorrect && <>Deze klopt niet. Kijk goed in je tabel van basisafgeleiden.</>

	// Assemble the checks for all input fields.
	const derivativeChecks = [
		originalFunction,
		sumWithWrongTerms,
		incorrectFunction,
	]
	const f1Checks = [fIncorrectCheck(1)]
	const f2Checks = [fIncorrectCheck(2)]
	const fDerivativeChecks = [fDerivativeIncorrectCheck]
	const feedbackChecks = [derivativeChecks, f1Checks, f2Checks, fDerivativeChecks, fDerivativeChecks]

	// Determine feedback.
	return getInputFieldFeedback(['derivative', 'f1', 'f2', 'f1Derivative', 'f2Derivative'], exerciseData, feedbackChecks.map(feedbackChecks => ({ feedbackChecks })))
}
