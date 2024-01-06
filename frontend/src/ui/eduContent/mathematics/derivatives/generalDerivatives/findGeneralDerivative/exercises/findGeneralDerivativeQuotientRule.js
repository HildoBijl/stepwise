import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getInputFieldFeedback, getMCFeedback } from 'ui/eduTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

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
				<Par>Bepaal via de quotiëntregel de afgeleide <M>h'\left({x}\right).</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="derivative" prelabel={<M>h'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.allMathSimpleVariables} validate={ExpressionInput.validation.validWithVariables([x])} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, fDerivative, gDerivative, derivative, derivativeSimplified }) => {
			return <Par>We bepalen eerst los de afgeleiden van <M>f\left({x}\right)</M> en <M>g\left({x}\right).</M> Via de standaard regels vinden we
				<BMList>
					<BMPart>f'\left({x}\right) = {fDerivative},</BMPart>
					<BMPart>g'\left({x}\right) = {gDerivative}.</BMPart>
				</BMList>
				Letterlijk toepassen van de quotiëntregel <M>h'\left({x}\right) = \frac(g\left({x}\right) f'\left({x}\right) - f\left({x}\right) g'\left({x}\right))(\left(g\left({x}\right)\right)^2)</M> geeft als oplossing <BM>h'\left({x}\right) = {derivative} = {derivativeSimplified}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution, input, shared } = exerciseData
	const { x } = solution

	// Define h derivative checks.
	const originalFunction = (input, correct, { h }) => onlyOrderChanges(input, h) && <>Dit is de oorspronkelijke functie. Je hebt hier nog niets mee gedaan.</>
	const incorrectFunction = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <>Dit is niet de afgeleide. Kijk goed naar of je de betreffende regel correct toegepast hebt.</>
	const derivativeChecks = [originalFunction, incorrectFunction]

	// Define f and g checks.
	const funcFeedback = {}
	if (input.f && input.g) {
		const isFCorrect = shared.checkF(input.f, solution.f)
		const isGCorrect = shared.checkF(input.g, solution.g)
		const isEquivalent = input.f && input.g && equivalent(input.f.divide(input.g), solution.h)
		const areFAndGCorrect = isFCorrect && isGCorrect && isEquivalent
		funcFeedback.f = { correct: areFAndGCorrect }
		funcFeedback.g = { correct: areFAndGCorrect }
		if (areFAndGCorrect) {
			funcFeedback.f.text = <>Dit is inderdaad een mogelijke functie <M>f\left({x}\right).</M></>
			funcFeedback.g.text = <>En dit is de bijbehorende functie <M>g\left({x}\right).</M></>
		} else if (isEquivalent) {
			funcFeedback.f.text = <>Dit is wat flauw. Het klopt wel dat <M>h\left({x}\right) = \frac(f\left({x}\right))(g\left({x}\right))</M> maar je maakt het probleem er niet makkelijker mee.</>
			funcFeedback.g.text = <>Deze is dus ook incorrect. Kijk of je de functie <M>h\left({x}\right)</M> simpelweg op kan splitsen in twee delen.</>
		} else if (isFCorrect && isGCorrect) {
			funcFeedback.f.text = <>Dit is een mogelijke functie <M>f\left({x}\right).</M> Hij past echter niet bij de onderstaande functie <M>g\left({x}\right)</M> om samen <M>h\left({x}\right)</M> te krijgen.</>
			funcFeedback.g.text = <>Dit is ook een mogelijke functie <M>g\left({x}\right).</M> Maar nog steeds geldt niet dat <M>h\left({x}\right) = \frac(f\left({x}\right))(g\left({x}\right)).</M> Kijk hier eens naar.</>
		} else if (isFCorrect) {
			funcFeedback.f.correct = true
			funcFeedback.f.text = <>Dit is een mogelijke functie <M>f\left({x}\right).</M></>
			funcFeedback.g.text = <>Hier gaat het helaas fout. Dit is geen correcte functie <M>g\left({x}\right).</M> Kijk goed of wel geldt dat <M>h\left({x}\right) = \frac(f\left({x}\right))(g\left({x}\right)).</M></>
		} else if (isGCorrect) {
			funcFeedback.g.correct = true
			funcFeedback.f.text = <>Dit is helaas geen mogelijke functie <M>f\left({x}\right).</M> Zorg wel dat <M>h\left({x}\right) = \frac(f\left({x}\right))(g\left({x}\right))</M> geldt.</>
			funcFeedback.g.text = <>Dit is wel een mogelijke functie <M>g\left({x}\right).</M></>
		} else {
			funcFeedback.f.text = <>Deze functie klopt niet. Zit dit wel in <M>h\left({x}\right)?</M></>
			funcFeedback.g.text = <>En deze klopt ook niet.</>
		}
	}

	// Determine feedback.
	return {
		...getMCFeedback('method', exerciseData, {
			text: [
				<>Dit klopt niet. Er staat geen vermenigvuldiging van "iets met <M>{x}</M>" maal "iets met <M>{x}</M>" in de functie <M>h\left({x}\right).</M> De productregel is dus niet van toepassing hier.</>,
				<>Er is inderdaad sprake van een deling.</>,
				<>Nee. Er is hier geen sprake van een functie van "iets met <M>{x}</M>". Er is wel een functie van <M>{x}</M> zelf, maar daar is de kettingregel niet voor nodig.</>,
			],
		}),
		...getInputFieldFeedback(['derivative'], exerciseData, [{ feedbackChecks: derivativeChecks }]),
		...funcFeedback,
	}
}
