import React from 'react'

import { deg2rad, roundToDigits } from 'step-wise/util/numbers'
import { numberArray } from 'step-wise/util/arrays'
import { Integer } from 'step-wise/CAS'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { Par, M, BM } from 'ui/components'
import { Drawing, drawingComponents, CornerLabel, LineLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import ExpressionInput, { numeric, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { useInput } from 'ui/form/Form'
import { InputSpace } from 'ui/form/FormPart'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import { hasIncorrectSide } from '../util/feedbackChecks/equation'

import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const { Polygon } = drawingComponents

const ruleNames = ['sinusregel', 'cosinusregel']

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { α, a, b, c } = state
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met zijden van <M>{b}</M> en <M>{c}.</M> De hoek tussen deze zijden is <M>{α}^\circ.</M> Bereken de lengte <M>{a}</M> van de resterende zijde. Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{a}</M>.</>,
				<>Er is één oplossing voor <M>{a}</M>.</>,
				<>Er zijn twee oplossingen voor <M>{a}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`a${numSolutions > 1 ? index : ''}`} prelabel={<M>{a}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} persistent={true} />)}
			</Par> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Bepaal welke regel we hier toe kunnen passen.</Par>
				<InputSpace>
					<MultipleChoice id="rule" choices={ruleNames.map((ruleName, index) => <>Gebruik de {ruleName}.</>)} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Er zijn bij dit probleem drie zijden betrokken: twee bekende en één onbekende zijden. Verder is er maar één gegeven hoek. Dit betekent dat de cosinusregel hier direct de resterende zijde kan geven.</Par>
		},
	},
	{
		Problem: (state) => {
			const { α, a } = state
			return <>
				<Par>Pas de betreffende regel letterlijk toe, gebruik makend van de hoek van <M>{α}^\circ.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={basicTrigonometryInDegrees} validate={validWithVariables(a)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, a, b, c } = state
			const { equationRaw, equation } = useSolution()
			return <Par>We passen de cosinusregel toe, gezien vanuit de hoek van <M>{α}^\circ.</M> Tegenover deze hoek staat zijde <M>{a}.</M> De andere zijden zijn <M>{b}</M> en <M>{c}.</M> De cosinusregel zegt nu dat <BM>{equationRaw}.</BM> Eventueel kunnen we dit nog eenvoudiger schrijven als <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { a } = state
			return <>
				<Par>Bepaal hoeveel geldige oplossingen deze vergelijking heeft.</Par>
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{a}</M>.</>,
						<>Er is één oplossing voor <M>{a}</M>.</>,
						<>Er zijn twee oplossingen voor <M>{a}</M>.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { a } = state
			return <>
				<Par>Meetkundig kunnen we zien dat er maar één mogelijke driehoek is die aan de gegevens voldoet. Immers, als we vanaf de bekende zijde de gegeven hoeken tekenen, en de lijnen doortrekken, dan krijgen we exact één snijpunt. Er is dus maar één driehoek die aan de gegeven waarden voldoet.</Par>
				<Par>Rekenkundig kunnen we ook zien dat er maar één oplossing is. Om <M>{a}</M> te vinden moeten we een kwadraat omkeren. Dit geeft normaliter ook een tweede (negatieve) oplossing, maar een negatieve afstand is hier niet van toepassing, en dus is er maar één passende oplossing voor <M>{a}.</M></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { a } = state
			return <>
				<Par>Los de vergelijking op voor <M>{a}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="a" prelabel={<M>{a}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, aRaw } = useSolution()
			return <Par>Om <M>{state.a}</M> te vinden nemen we van beide kanten van de vergelijking de wortel. Een plus/minus is hier niet nodig, omdat een negatieve afstand niet correct kan zijn. (Dit zou de afstand zijn als we de driehoek bij de hoek van <M>{α}^\circ</M> spiegelen.) Het resultaat is <BM>{state.a} = {aRaw}.</BM> Hiermee is de gevraagde zijde berekend. Het zou overeen komen met een afstand van <M>{state.a} \approx {new Float(roundToDigits(aRaw.number, 3))}</M> wat lijkt te kloppen met de afbeelding.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine MC feedback text in various cases.
	const ruleText = [
		<>Nee. Er zijn drie zijden betrokken en slechts één hoek, en dus is de sinusregel hier niet handig om te gebruiken. Dan moeten er minimaal twee betrokken hoeken zijn.</>,
		<>Ja! Er zijn immers drie zijden betrokken bij ons probleem: twee bekende en één onbekende.</>,
	]
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Inderdaad. Er is één driehoek die aan de gegeven waarden voldoet.</>,
		<>Nee, er zijn geen twee driehoeken die aan de gegeven waarden voldoen. Als je vanaf de gegeven zijde de lijnen met de gegeven hoeken tekent, dan is er maar één snijpunt mogelijk.</>,
	]

	// Set up feedback checks for the equation field.
	const leftSideNoSquare = (input, correct, solution, isCorrect) => !isCorrect && (!input.left.isSubtype('Power') || !input.left.exponent.equals(Integer.two)) && <>De cosinusregel heeft aan de linkerkant een kwadraat. Dat is bij jouw vergelijking niet het geval.</>
	const equationChecks = [leftSideNoSquare, hasIncorrectSide]

	return {
		...getMCFeedback('rule', exerciseData, { text: ruleText }),
		...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
		...getInputFieldFeedback(['equation', 'a'], exerciseData, [equationChecks, []].map(feedbackChecks => ({ feedbackChecks }))),
	}
}

function ExerciseFigure() {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution)
	const { rotation, reflection, α, a, b, c } = state

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
	return <Drawing transformationSettings={transformationSettings} svgContents={<>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
	</>} htmlContents={<>
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{c}</M></LineLabel>
		<LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{a}</M></LineLabel>
		<LineLabel points={[points[2], points[0]]} oppositeTo={points[1]}><M>{b}</M></LineLabel>
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}^\circ</M></CornerLabel>
	</>} />
}

function getPoints(solution) {
	const { b, c, α } = solution
	const αRad = deg2rad(α.number)
	return [
		new Vector(0, 0),
		new Vector(c.number, 0),
		new Vector(b.number * Math.cos(αRad), b.number * Math.sin(αRad)),
	]
}
