import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { M, BM, BMList, BMPart } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { allMathSimpleVariables, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'

import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const { onlyOrderChanges, equivalent, constantMultiple } = expressionComparisons

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, h } = useSolution()
	return <>
		<Par>Gegeven is de functie <BM>h\left({x}\right) = {h}.</BM> Bepaal de afgeleide <M>h'\left({x}\right).</M></Par>
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
				<Par>Bepaal de toe te passen regel. Stel dat je, voor gegeven <M>{x},</M> de bovenstaande functie uitrekent. Bepaal de laatste operatie die je dan conform de voorrangsregels uitvoert. (Negeer hierbij optellen/aftrekken en constante vermenigvuldigingen.)</Par>
				<InputSpace>
					<MultipleChoice id="method" choices={[
						<>Een vermenigvuldiging van "iets met <M>{x}</M>" maal "iets met <M>{x}</M>". We passen de productregel toe.</>,
						<>Een deling van "iets met <M>{x}</M>" gedeeld door "iets met <M>{x}</M>". We passen de quotiëntregel toe.</>,
						<>Een ander soort functie toegepast op "iets met <M>{x}</M>". We passen de kettingregel toe.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x } = useSolution()
			return <Par>In dit geval is de laatste operatie een vermenigvuldiging van "iets met <M>{x}</M>" maal "iets met <M>{x}</M>". We gaan dus de productregel toepassen.</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal functies <M>f\left({x}\right)</M> en <M>g\left({x}\right)</M> zodat <M>h\left({x}\right) = f\left({x}\right) g\left({x}\right).</M> (Zorg tevens dat <M>f\left({x}\right)</M> en <M>g\left({x}\right)</M> makkelijker af te leiden zijn dan <M>h\left({x}\right)</M> zelf.)</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="f" prelabel={<M>f\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} />
						<ExpressionInput id="g" prelabel={<M>g\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, f, g } = useSolution()
			return <Par>Als we de functie <M>h\left({x}\right)</M> opsplitsen bij de vermenigvuldiging, dan zien we direct dat
				<BMList>
					<BMPart>f\left({x}\right) = {f},</BMPart>
					<BMPart>g\left({x}\right) = {g},</BMPart>
				</BMList>
				aan de gestelde voorwaarden voldoen.</Par>
		},
	},
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
			const { x, switched, fDerivative, gDerivative } = useSolution()
			if (switched) {
				return <Par>De afgeleide van <M>f\left({x}\right)</M> is relatief lastig: we hebben de kettingregel nodig. Via de gebruikelijke stappen vinden we uiteindelijk
					<BM>f'\left({x}\right) = {fDerivative}.</BM>
					De afgeleide van <M>g\left({x}\right)</M> volgt direct uit onze tabel van basisafgeleiden als
					<BM>g'\left({x}\right) = {gDerivative}.</BM>
				</Par>
			}
			return <Par>De afgeleide van <M>f\left({x}\right)</M> volgt direct uit onze tabel van basisafgeleiden als
				<BM>f'\left({x}\right) = {fDerivative}.</BM>
				De afgeleide van <M>g\left({x}\right)</M> is lastiger: we hebben de kettingregel nodig. Via de gebruikelijke stappen vinden we uiteindelijk
				<BM>g'\left({x}\right) = {gDerivative}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal via de productregel de afgeleide <M>h'\left({x}\right).</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, derivative, derivativeSimplified } = useSolution()
			return <Par>Letterlijk toepassen van de productregel <M>h'\left({x}\right) = f'\left({x}\right) g\left({x}\right) + f\left({x}\right) g'\left({x}\right)</M> geeft als oplossing <BM>h'\left({x}\right) = {derivative} = {derivativeSimplified}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution } = exerciseData
	const { x, switched } = solution

	// Define h derivative checks.
	const originalFunction = (input, correct, { h }) => onlyOrderChanges(input, h) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de betreffende regel correct toegepast hebt.</>
	const derivativeChecks = [originalFunction, incorrectFunction]

	// Define f and g checks.
	const missingConstant = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const fIncorrect = (input, correct, solution, isCorrect) => !isCorrect && <>Er gaat hier iets mis. Controleer goed of het product <M>f\left({x}\right) g\left({x}\right)</M> wel gelijk is aan <M>h\left({x}\right).</M></>
	const gIncorrect = (input, correct, solution, isCorrect) => !isCorrect && <>En deze klopt dus ook niet.</>
	const fChecks = [missingConstant, fIncorrect]
	const gChecks = [missingConstant, gIncorrect]

	// Define fDerivative and gDerivative checks.
	const fDerivativeConstantMultiple = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const fText = <>Deze klopt niet. Kijk goed in je tabel van basisafgeleiden.</>
	const gText = <>Deze klopt niet. Heb je de kettingregel wel goed toegepast?</>
	const fDerivativeIncorrect = (input, correct, solution, isCorrect) => !isCorrect && (switched ? gText : fText)
	const gDerivativeIncorrect = (input, correct, solution, isCorrect) => !isCorrect && (switched ? fText : gText)
	const fDerivativeChecks = [fDerivativeConstantMultiple, fDerivativeIncorrect]
	const gDerivativeChecks = [fDerivativeConstantMultiple, gDerivativeIncorrect]

	// Determine feedback.
	const feedbackChecks = [derivativeChecks, fChecks, gChecks, fDerivativeChecks, gDerivativeChecks]
	return {
		...getMCFeedback('method', exerciseData, {
			text: [
				<>Er is inderdaad sprake van een vermenigvuldiging als laatste operatie.</>,
				<>Dit klopt niet. Er staat geen deling in de functie <M>h\left({x}\right).</M> De quotiëntregel is dus niet van toepassing hier.</>,
				<>Nee. Er is wel sprake van een functie van "iets met <M>{x}</M>", maar dit is niet de <em>laatste</em> operatie.</>,
			],
		}),
		...getInputFieldFeedback(['derivative', 'f', 'g', 'fDerivative', 'gDerivative'], exerciseData, feedbackChecks.map(feedbackChecks => ({ feedbackChecks }))),
	}
}
