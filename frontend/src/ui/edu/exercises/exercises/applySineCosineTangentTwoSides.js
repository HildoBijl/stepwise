import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'
import { Vector } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, CornerLabel, LineLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import ExpressionInput, { numeric, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/FormPart'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const { Polygon, RightAngle } = components

const ruleNames = ['SOS', 'CAS', 'TOA']
const funcNames = ['sinus', 'cosinus', 'tangens']
const sides = ['aanliggende', 'overstaande', 'schuine']

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { beta } = state
	const { a, b, c, notGiven } = useSolution()

	return <>
		<Par>Gegeven is de onderstaande driehoek met zijden <M>{notGiven === 0 ? b : a}</M> en <M>{notGiven === 2 ? b : c}.</M> Bereken de hoek <M>{beta}.</M> Werk in graden en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<ExpressionInput id="ans" prelabel={<M>{beta}=</M>} size="s" settings={basicTrigonometryInDegrees} validate={numeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Bekijk, vanuit de hoek gezien, welke zijden gegeven zijn. Bepaal hiermee de te gebruiken regel.</Par>
				<InputSpace>
					<MultipleChoice id="rule" choices={funcNames.map((funcName, index) => <>Gebruik de {funcName} met behulp van {ruleNames[index]}.</>)} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { notGiven, rule } = useSolution()
			return <Par>Vanuit de hoek gezien zijn de {notGiven === 1 ? sides[0] : sides[1]} en de {notGiven === 2 ? sides[0] : sides[1]} zijden gegeven. Dit betekent dat {ruleNames[rule]} van toepassing is en we dus de {funcNames[rule]} gaan gebruiken.</Par>
		},
	},
	{
		Problem: (state) => {
			const { beta } = state
			return <>
				<Par>Pas de betreffende regel letterlijk toe op de gegeven driehoek met hoek <M>{state.beta}.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={basicTrigonometryInDegrees} validate={validWithVariables(beta)} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { notGiven, rule, a, b, c, equation } = useSolution()
			return <Par>We gebruiken {ruleNames[rule]}. De {notGiven === 1 ? <>{sides[0]} zijde is <M>{a}</M></> : <>{sides[1]} zijde is <M>{b}</M></>} en de {notGiven === 2 ? <>{sides[0]} zijde is <M>{a}.</M></> : <>{sides[2]} zijde is <M>{c}.</M></>} De {ruleNames[rule]}-regel zegt nu direct dat <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { beta } = state
			return <>
				<Par>Los de vergelijking op voor <M>{beta}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{beta}=</M>} size="s" settings={basicTrigonometryInDegrees} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { beta } = state
			const { rule, ansRaw, ans, canSimplifyAns } = useSolution()
			return <Par>Om <M>{beta}</M> op te lossen nemen we van beide kanten de omgekeerde {funcNames[rule]} (de arc{funcNames[rule]}). Hiermee krijgen we <BM>{beta} = {ansRaw}.</BM>{canSimplifyAns ? <>Dit kan eventueel (niet verplicht) nog verder vereenvoudigd worden tot <BM>{beta} = {ans}{ans.isSubtype('Integer') ? `^\\circ` : ``}.</BM></> : null}</Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution } = exerciseData
	const { rule, notGiven } = solution

	// Determine MC feedback text in various cases.
	const text = ruleNames.map((ruleName, index) => index === rule ? <>Klopt. De {notGiven === 1 ? sides[0] : sides[1]} en {notGiven === 2 ? sides[0] : sides[2]} zijden zijn gegeven, en dus gebruik je {ruleName}.</> : <>Nee. De {sides[notGiven]} zijde is niet gegeven, en dus kun je {ruleName} hier niet direct gebruiken.</>)

	// Set up feedback checks for the ans field.
	const hasNoArcFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.isSubtype('Arcsin') && !input.isSubtype('Arccos') && !input.isSubtype('Arctan') && <>Je zit nog niet in de buurt. Er werd een antwoord verwacht met een omgekeerde sinus/cosinus/tangens.</>
	const hasWrongArcFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.isSubtype(correct.constructor) && <>Je hebt niet de juiste goniometrische functie (sinus/cosinus/tangens) gebruikt.</>
	const ansRemaining = (input, correct, solution, isCorrect) => !isCorrect && <>Je hebt de juiste goniometrische functie, maar erbinnen gaat iets mis. Heb je wel de juiste zijden door elkaar gedeeld?</>
	const ansChecks = [hasNoArcFunction, hasWrongArcFunction, ansRemaining]

	// Set up feedback checks for the equation field.
	const hasNoFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.left.isSubtype('Sin') && !input.left.isSubtype('Cos') && !input.left.isSubtype('Tan') && <>Aan de linkerkant wordt een goniometrische functie (sinus/cosinus/tangens) verwacht. Kijk nog eens goed naar hoe je de betreffende regel toepast.</>
	const hasWrongFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.left.isSubtype(correct.left) && <>Je hebt aan de linkerkant niet de juiste goniometrische functie (sinus/cosinus/tangens) gebruikt. Kijk nog eens goed naar welke regel je toepast.</>
	const hasWrongLeft = (input, correct, { beta }, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.left, correct.left) && <>Je moet aan de linkerkant binnenin de functie simpelweg de hoek <M>{beta}</M> gebruiken.</>
	const equationRemaining = (input, correct, solution, isCorrect) => !isCorrect && <>De linkerkant klopt, maar de rechterkant is niet correct. Heb je wel de juiste zijden door elkaar gedeeld?</>
	const equationChecks = [hasNoFunction, hasWrongFunction, hasWrongLeft, equationRemaining]

	return {
		...getMCFeedback('rule', exerciseData, { text }),
		...getInputFieldFeedback(['ans', 'equation'], exerciseData, [ansChecks, equationChecks].map(feedbackChecks => ({ feedbackChecks }))),
	}
}

function ExerciseFigure() {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution)
	const { rotation, reflection, a, b, c, notGiven } = solution

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useScaleToBoundsTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})
	const labelSize = 26

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings} maxWidth={bounds => bounds.width} svgContents={<>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
		<RightAngle points={points} />
	</>} htmlContents={<>
		{notGiven === 0 ? null : <LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{a}</M></LineLabel>}
		{notGiven === 1 ? null : <LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{b}</M></LineLabel>}
		{notGiven === 2 ? null : <LineLabel points={[points[0], points[2]]} oppositeTo={points[1]}><M>{c}</M></LineLabel>}
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{state.beta}</M></CornerLabel>
	</>} />
}

function getPoints(solution) {
	const { a, b } = solution
	return [
		new Vector(a.number, 0),
		new Vector(0, 0),
		new Vector(0, b.number),
	]
}
