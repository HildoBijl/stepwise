import React from 'react'

import { deg2rad, roundToDigits, numberArray } from 'step-wise/util'
import { Integer } from 'step-wise/CAS'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { Par, M, BM } from 'ui/components'
import { Drawing, Polygon, CornerLabel, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { MultipleChoice, ExpressionInput, EquationInput } from 'ui/inputs'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import { hasIncorrectSide } from '../util/feedbackChecks/equation'

import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const ruleNames = ['sinusregel', 'cosinusregel']

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { α, a, b, c } = state
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met zijden van <M>{a},</M> <M>{b}</M> en <M>{c}.</M> Bereken de hoek <M>{α}</M> (in graden) die ligt tussen de zijden van <M>{b}</M> en <M>{c}.</M> Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{α}</M>.</>,
				<>Er is één oplossing voor <M>{α}</M>.</>,
				<>Er zijn twee oplossingen voor <M>{α}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`α${numSolutions > 1 ? index : ''}`} prelabel={<M>{α}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} persistent={true} />)}
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
			return <Par>Er zijn bij dit probleem drie zijden gegeven en geen hoeken. Dit betekent dat de cosinusregel hier direct elke benodigde hoek kan geven.</Par>
		},
	},
	{
		Problem: (state) => {
			const { α } = state
			return <>
				<Par>Pas de betreffende regel letterlijk toe, gebruik makend van hoek <M>{α}.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={EquationInput.settings.basicTrigonometryInDegrees} validate={EquationInput.validation.validWithVariables(α)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, a, b, c } = state
			const { equationRaw, equation } = useSolution()
			return <Par>We passen de cosinusregel toe, gezien vanuit hoek <M>{α}.</M> Tegenover deze hoek staat zijde <M>{a}.</M> De andere zijden zijn <M>{b}</M> en <M>{c}.</M> De cosinusregel zegt nu dat <BM>{equationRaw}.</BM> Eventueel kunnen we dit nog eenvoudiger schrijven als <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { α } = state
			return <>
				<Par>Bepaal hoeveel geldige oplossingen deze vergelijking heeft.</Par>
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{α}</M>.</>,
						<>Er is één oplossing voor <M>{α}</M>.</>,
						<>Er zijn twee oplossingen voor <M>{α}</M>.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α } = state
			return <>
				<Par>Meetkundig kunnen we zien dat er maar één mogelijke driehoek is die aan de gegevens voldoet. Immers, als je van drie bekende zijden een driehoek maakt, dan is er altijd maar één driehoek mogelijk. (Tenzij één zijde groter is dan de andere twee samen: dan is het niet mogelijk om een driehoek te maken. Maar dat is hier niet het geval.)</Par>
				<Par>Rekenkundig kunnen we ook zien dat er maar één oplossing is. Om <M>{α}</M> te vinden moeten we een cosinus omkeren, en voor driehoeken (dus in het bereik van <M>0^\circ</M> tot <M>180^\circ</M>) geeft dit altijd maar één oplossing.</Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { α } = state
			return <>
				<Par>Los de vergelijking op voor <M>{α}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="α" prelabel={<M>{α}=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { intermediateEquation, α } = useSolution()
			return <Par>Om <M>{state.α}</M> te vinden isoleren we eerst <M>{intermediateEquation.left}.</M> Zo vinden we <BM>{intermediateEquation}.</BM> Vervolgens nemen we van beide kanten de omgekeerde cosinus. Het resultaat is <BM>{state.α} = {α}.</BM> Hiermee is de gevraagde hoek berekend. Het zou overeen komen met een waarde van <M>{state.α} \approx {new Float(roundToDigits(α.number, 3))}^\circ</M> wat lijkt te kloppen met de afbeelding.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine MC feedback text in various cases.
	const ruleText = [
		<>Nee. Er zijn drie zijden betrokken en slechts één hoek, en dus is de sinusregel hier niet handig om te gebruiken. Dan moeten er minimaal twee betrokken hoeken zijn.</>,
		<>Ja! Er zijn immers drie zijden betrokken bij ons probleem: de drie gegeven zijden.</>,
	]
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Inderdaad. Met drie gegeven zijden is er altijd maar (maximaal) één driehoek mogelijk.</>,
		<>Nee, er zijn geen twee driehoeken die aan de gegeven waarden voldoen. Als je de drie zijden van een driehoek weet, dan kun je met die drie zijden altijd maar (maximaal) één driehoek maken.</>,
	]

	// Set up feedback checks for the equation field.
	const leftSideNoSquare = (input, correct, solution, isCorrect) => !isCorrect && (!input.left.isSubtype('Power') || !input.left.exponent.equals(Integer.two)) && <>De cosinusregel heeft aan de linkerkant een kwadraat. Dat is bij jouw vergelijking niet het geval.</>
	const equationChecks = [leftSideNoSquare, hasIncorrectSide]

	return {
		...getMCFeedback('rule', exerciseData, { text: ruleText }),
		...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
		...getInputFieldFeedback(['equation', 'α'], exerciseData, [equationChecks, []].map(feedbackChecks => ({ feedbackChecks }))),
	}
}

function ExerciseFigure() {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution)
	const { rotation, reflection, α, a, b, c } = state

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useBoundsBasedTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})
	const labelSize = 30

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings}>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{c}</M></LineLabel>
		<LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{a}</M></LineLabel>
		<LineLabel points={[points[2], points[0]]} oppositeTo={points[1]}><M>{b}</M></LineLabel>
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}</M></CornerLabel>
	</Drawing>
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
