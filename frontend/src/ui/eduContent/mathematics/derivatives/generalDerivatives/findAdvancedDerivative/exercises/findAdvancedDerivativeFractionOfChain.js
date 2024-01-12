import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, Substep, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

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
		Solution: ({ x }) => {
			return <Par>In dit geval is de laatste operatie een deling van "iets met <M>{x}</M>" gedeeld door "iets met <M>{x}</M>". We gaan dus de quotiëntregel toepassen.</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal functies <M>f\left({x}\right)</M> en <M>g\left({x}\right)</M> zodat <M>h\left({x}\right) = \frac(f\left({x}\right))(g\left({x}\right)).</M> (Zorg tevens dat <M>f\left({x}\right)</M> en <M>g\left({x}\right)</M> makkelijker af te leiden zijn dan <M>h\left({x}\right)</M> zelf.)</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="f" prelabel={<M>f\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
						<ExpressionInput id="g" prelabel={<M>g\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, f, g }) => {
			return <Par>Als we de functie <M>h\left({x}\right)</M> opsplitsen bij de deling, dan zien we direct dat
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
						<Substep ss={1}><ExpressionInput id="fDerivative" prelabel={<M>f'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
						<Substep ss={2}><ExpressionInput id="gDerivative" prelabel={<M>g'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} /></Substep>
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, fDerivative, gDerivative }) => {
			return <Par>Voor de afgeleide van <M>f\left({x}\right)</M> hebben we de kettingregel nodig. Via de gebruikelijke stappen vinden we zo
				<BM>f'\left({x}\right) = {fDerivative}.</BM>
				De afgeleide van <M>g\left({x}\right)</M> volgt direct uit onze tabel van basisafgeleiden als
				<BM>g'\left({x}\right) = {gDerivative}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal via de quotiëntregel de afgeleide <M>h'\left({x}\right).</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, derivativeRaw, derivative }) => {
			return <Par>Letterlijk toepassen van de quotiëntregel <M>h'\left({x}\right) = \frac(g\left({x}\right) f'\left({x}\right) - f\left({x}\right) g'\left({x}\right))(\left(g\left({x}\right)\right)^2)</M> geeft als oplossing <BM>h'\left({x}\right) = {derivativeRaw} = {derivative}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution } = exerciseData
	const { x } = solution

	// Define h derivative checks.
	const originalFunction = (input, correct, { h }) => onlyOrderChanges(input, h) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de betreffende regel correct toegepast hebt.</>
	const derivativeChecks = [originalFunction, incorrectFunction]

	// Define f and g checks.
	const missingConstant = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const fIncorrect = (input, correct, solution, isCorrect) => !isCorrect && <>Dit is niet de teller van de breuk. Kijk goed naar wat bovenin de breuk staat.</>
	const gIncorrect = (input, correct, solution, isCorrect) => !isCorrect && <>Dit is niet de noemer van de breuk. Kijk goed naar wat onderin de breuk staat.</>
	const fChecks = [missingConstant, fIncorrect]
	const gChecks = [missingConstant, gIncorrect]

	// Define fDerivative and gDerivative checks.
	const fDerivativeConstantMultiple = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const fDerivativeIncorrect = (input, correct, solution, isCorrect) => !isCorrect && <>Deze klopt niet. Heb je de kettingregel wel goed toegepast?</>
	const gDerivativeIncorrect = (input, correct, solution, isCorrect) => !isCorrect && <>Deze klopt niet. Kijk goed in je tabel van basisafgeleiden.</>
	const fDerivativeChecks = [fDerivativeConstantMultiple, fDerivativeIncorrect]
	const gDerivativeChecks = [fDerivativeConstantMultiple, gDerivativeIncorrect]

	// Determine feedback.
	return {
		...getMCFeedback(exerciseData, {
			method: [
				<>Dit klopt niet. Er staat geen vermenigvuldiging van "iets met <M>{x}</M>" maal "iets met <M>{x}</M>" in de functie <M>h\left({x}\right).</M> De productregel is dus niet van toepassing hier.</>,
				<>Er is inderdaad sprake van een deling als laatste operatie.</>,
				<>Bijna! Er is hier wel sprake van een functie van "iets met <M>{x}</M>". Dit is echter niet de <em>laatste</em> operatie die je uitvoert.</>,
			],
		}),
		...getFieldInputFeedback(exerciseData, {
			f: fChecks,
			g: gChecks,
			fDerivative: fDerivativeChecks,
			gDerivative: gDerivativeChecks,
			derivative: derivativeChecks,
		}),
	}
}
