import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

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
		Solution: ({ x, fRaw }) => {
			return <Par>In dit geval is de laatste operatie de operatie <M>{fRaw},</M> waar we er "iets met <M>{x}</M>" instoppen. Dit is geen product of deling maar een ander soort operatie. We gaan dus de kettingregel toepassen.</Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal functies <M>f\left({x}\right)</M> en <M>g\left({x}\right)</M> zodat <M>h\left({x}\right) = f\left(g\left({x}\right)\right).</M> (Zorg tevens dat <M>f\left({x}\right)</M> en <M>g\left({x}\right)</M> makkelijker af te leiden zijn dan <M>h\left({x}\right)</M> zelf.)</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="f" prelabel={<M>f\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
						<ExpressionInput id="g" prelabel={<M>g\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, fRaw, f, g }) => {
			return <Par>We weten dat we <M>{fRaw}</M> als laatste operatie toepassen. De buitenste functie <M>f\left({x}\right)</M> moet dus in ieder geval deze operatie bevatten. Wat we in die operatie stoppen wordt dan <M>g\left({x}\right).</M> Zo vinden we
				<BMList>
					<BMPart>f\left({x}\right) = {f},</BMPart>
					<BMPart>g\left({x}\right) = {g}.</BMPart>
				</BMList>
				Na controle zien we inderdaad dat hiermee geldt dat <M>h\left({x}\right) = f\left(g\left({x}\right)\right).</M></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal via de kettingregel de afgeleide <M>h'\left({x}\right).</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, fDerivative, gDerivative, derivativeRaw, derivative }) => {
			return <Par>We bepalen eerst los de afgeleiden van <M>f\left({x}\right)</M> en <M>g\left({x}\right).</M> Via de standaard regels vinden we
				<BMList>
					<BMPart>f'\left({x}\right) = {fDerivative},</BMPart>
					<BMPart>g'\left({x}\right) = {gDerivative}.</BMPart>
				</BMList>
				Letterlijk toepassen van de kettingregel <M>h'\left({x}\right) = f'\left(g\left({x}\right)\right) g'\left({x}\right)</M> geeft als oplossing <BM>h'\left({x}\right) = {derivativeRaw} = {derivative}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution } = exerciseData
	const { x, fRaw } = solution

	// Define h derivative checks.
	const originalFunction = (input, correct, { h }) => onlyOrderChanges(input, h) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de betreffende regel correct toegepast hebt.</>
	const derivativeChecks = [originalFunction, incorrectFunction]

	// Define f and g checks.
	const missingConstant = (input, correct, solution, isCorrect) => !isCorrect && constantMultiple(input, correct) && <>Je zit er een constante vermenigvuldiging naast. Kijk goed naar de factor voor de functie.</>
	const incorrectF = (input, correct, solution, isCorrect) => !isCorrect && <>Dit is niet de buitenste functie. Onthoud: de buitenste functie bevat de <em>laatste</em> operatie die je uitvoert. Dus iets met <M>{fRaw}.</M></>
	const incorrectG = (input, correct, solution, isCorrect) => !isCorrect && <>Dit is niet de binnenste funtie. Onthoud: de binnenste functie is wat je <em>in</em> de laatste operatie (hier <M>{fRaw}</M>) stopt.</>
	const fChecks = [missingConstant, incorrectF]
	const gChecks = [missingConstant, incorrectG]

	// Determine feedback.
	return {
		...getMCFeedback(exerciseData, {
			method: [
				<>Dit is niet correct. Er is geen vermenigvuldiging van "iets met <M>{x}</M>" maal "iets met <M>{x}</M>". Er is alleen een constante vermenigvuldiging.</>,
				<>Dit klopt niet. Er staat geen deling in de functie <M>h\left({x}\right).</M> De quotiëntregel is dus niet van toepassing hier.</>,
				<>Er is inderdaad sprake van een functie van "iets met <M>{x}</M>". Specifiek hebben we de functie <M>{fRaw}</M> waar we iets instoppen.</>,
			],
		}),
		...getFieldInputFeedback(exerciseData, {
			f: fChecks,
			g: gChecks,
			derivative: derivativeChecks,
		}),
	}
}
