import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'
import { Vector } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, CornerLabel, LineLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import ExpressionInput, { validAndNumeric, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
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
	const solution = useSolution(state)
	const { x, beta, y } = solution

	return <>
		<Par>Gegeven is de onderstaande driehoek met zijde <M>{x}</M> en hoek <M>{beta}^\circ.</M> Bereken de onbekende zijde <M>{y}.</M> Werk in graden en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure state={state} solution={solution} />
		<InputSpace>
			<ExpressionInput id="ans" prelabel={<M>{y}=</M>} size="s" settings={basicTrigonometryInDegrees} validate={validAndNumeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			return <>
				<Par>Bekijk, vanuit de hoek gezien, welke zijden gegeven/gevraagd zijn. Bepaal hiermee de te gebruiken regel.</Par>
				<InputSpace>
					<MultipleChoice id="rule" choices={funcNames.map((funcName, index) => <>Gebruik de {funcName} met behulp van {ruleNames[index]}.</>)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { notGiven, rule } = useSolution(state)
			return <Par>Vanuit de hoek gezien zijn de {notGiven === 1 ? sides[0] : sides[1]} en de {notGiven === 2 ? sides[0] : sides[1]} zijden gegeven/gevraagd. Dit betekent dat {ruleNames[rule]} van toepassing is en we dus de {funcNames[rule]} gaan gebruiken.</Par>
		},
	},
	{
		Problem: (state) => {
			const { y } = state
			return <>
				<Par>Pas de betreffende regel letterlijk toe op de gegeven driehoek met onbekende zijde <M>{y}.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={basicTrigonometryInDegrees} validate={validWithVariables(y)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { known, requested, rule, x, y, beta, equation } = useSolution(state)
			return <Par>We gebruiken {ruleNames[rule]}. De {sides[known]} zijde is <M>{x}</M> en de {sides[requested]} zijde is <M>{y}.</M> Met de hoek van <M>{beta}^\circ</M> zegt de {ruleNames[rule]}-regel nu direct dat <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { y } = state
			return <>
				<Par>Los de vergelijking op voor <M>{y}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{y}=</M>} size="s" settings={basicTrigonometryInDegrees} validate={validAndNumeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { y, ansRaw, ans, canSimplifyAns } = useSolution(state)
			return <Par>Het herschrijven van de breuk geeft direct de oplossing <BM>{y}={ansRaw}.</BM>{canSimplifyAns ? <>Dit kan eventueel (niet verplicht) nog verder vereenvoudigd worden tot <BM>{y} = {ans}.</BM></> : null}</Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution } = exerciseData
	const { x, rule, known, requested } = solution
	const notInvolved = 3 - known - requested

	// Define a handler for finding the right function.
	const finder = expression => expression.isSubtype(['Sin', 'Cos', 'Tan'][rule])

	// Determine MC feedback text in various cases.
	const text = ruleNames.map((ruleName, index) => index === rule ? <>Klopt. De {notInvolved === 1 ? sides[0] : sides[1]} en {notInvolved === 2 ? sides[0] : sides[2]} zijden zijn gegeven/gevraagd, en dus gebruik je {ruleName}.</> : <>Nee. De {sides[notInvolved]} zijde is niet gegeven/gevraagd, en dus heb je hier weinig aan het gebruik van {ruleName}.</>)

	const hasNoTrigFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.recursiveSome(expression => expression.isSubtype('Sin') || expression.isSubtype('Cos') || expression.isSubtype('Tan')) && <>Ergens in het antwoord wordt een goniometrische functie (sinus/cosinus/tangens) verwacht. Deze zit niet in je antwoord.</>
	const hasNoCorrectTrigFunction = (input, correct, { rule }, isCorrect) => !isCorrect && !input.recursiveSome(finder) && <>Je hebt niet de juiste goniometrische functie (sinus/cosinus/tangens) gebruikt.</>
	const hasIncorrectTrigFunctionArgument = (input, correct, { rule }, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.find(finder).argument, correct.find(finder).argument) && <>Je hebt de juiste goniometrische functie gebruikt, maar tussen de haakjes gaat er iets mis.</>
	const hasMissingSide = (input, correct, solution, isCorrect) => !isCorrect && !input.find(expression => x.equals(expression)) && <>Heb je de bekende zijde van <M>{x}</M> wel in je antwoord gebruikt?</>
	const isWrongForm = (input, correct, solution, isCorrect) => !isCorrect && !input.isSubtype(correct) && <>Als antwoord wordt een {correct.isSubtype('Fraction') ? 'deling' : 'vermenigvuldiging'} van termen verwacht. Dat is bij jouw antwoord niet het geval. Heb je je vergelijking wel correct herschreven?</>
	const ansRemaining = (input, correct, solution, isCorrect) => !isCorrect && <>Je antwoord heeft de juiste onderdelen, maar je hebt bij het herschrijven van je vergelijking een foutje gemaakt.</>
	const ansChecks = [hasNoTrigFunction, hasNoCorrectTrigFunction, hasIncorrectTrigFunctionArgument, hasMissingSide, isWrongForm, ansRemaining]

	const hasNoFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.left.isSubtype('Sin') && !input.left.isSubtype('Cos') && !input.left.isSubtype('Tan') && <>Aan de linkerkant wordt een goniometrische functie (sinus/cosinus/tangens) verwacht. Kijk nog eens goed naar hoe je de betreffende regel toepast.</>
	const hasWrongFunction = (input, correct, solution, isCorrect) => !isCorrect && !input.left.isSubtype(correct.left) && <>Je hebt aan de linkerkant niet de juiste goniometrische functie (sinus/cosinus/tangens) gebruikt. Kijk nog eens goed naar welke regel je toepast.</>
	const hasWrongLeft = (input, correct, { beta }, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.left, correct.left) && <>Je moet aan de linkerkant binnenin de functie simpelweg de hoek van <M>{beta}</M> graden gebruiken.</>
	const equationRemaining = (input, correct, solution, isCorrect) => !isCorrect && <>De linkerkant klopt, maar de rechterkant is niet correct. Heb je wel de juiste zijden door elkaar gedeeld?</>
	const equationChecks = [hasNoFunction, hasWrongFunction, hasWrongLeft, equationRemaining]

	return {
		...getMCFeedback('rule', exerciseData, { text }),
		...getInputFieldFeedback(['ans', 'equation'], exerciseData, [ansChecks, equationChecks].map(feedbackChecks => ({ feedbackChecks }))),
	}
}

function ExerciseFigure({ state, solution }) {
	const points = getPoints(solution)
	const pointsInSideOrder = [2, 0, 1].map(index => points[index])
	const { rotation, reflection, known, x, requested, y } = solution

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useScaleToBoundsTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})
	const labelSize = 30

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings} maxWidth={bounds => bounds.width} svgContents={<>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
		<RightAngle points={points} />
	</>} htmlContents={<>
		<LineLabel points={[pointsInSideOrder[(known + 1) % 3], pointsInSideOrder[(known + 2) % 3]]} oppositeTo={pointsInSideOrder[known]}><M>{x}</M></LineLabel>
		<LineLabel points={[pointsInSideOrder[(requested + 1) % 3], pointsInSideOrder[(requested + 2) % 3]]} oppositeTo={pointsInSideOrder[requested]}><M>{y}</M></LineLabel>
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{state.beta}^\circ</M></CornerLabel>
	</>} />
}

function getPoints(solution) {
	const { a, b } = solution
	return [
		new Vector(a.number, 0), // Point B.
		new Vector(0, 0), // Point C.
		new Vector(0, b.number), // Point A.
	]
}
