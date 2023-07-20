import React from 'react'

import { deg2rad, roundToDigits } from 'step-wise/util/numbers'
import { numberArray } from 'step-wise/util/arrays'
import { Integer } from 'step-wise/CAS'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { Drawing, Polygon, CornerLabel, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { MultipleChoice } from 'ui/inputs'
import ExpressionInput, { numeric, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import { hasIncorrectSide } from '../util/feedbackChecks/equation'

import { getInputFieldFeedback, getInputFieldListFeedback, getMCFeedback } from '../util/feedback'

const ruleNames = ['sinusregel', 'cosinusregel']

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { α, a, b, c } = state
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met zijden van <M>{a}</M> en <M>{c}.</M> De hoek tegenover de zijde van <M>{a}</M> is <M>{α}^\circ.</M> Bereken de lengte <M>{b}</M> van de resterende zijde. Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{b}</M>.</>,
				<>Er is één oplossing voor <M>{b}</M>.</>,
				<>Er zijn twee oplossingen voor <M>{b}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`b${numSolutions > 1 ? index : ''}`} prelabel={<M>{b}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} persistent={true} />)}
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
			const { α, b } = state
			return <>
				<Par>Pas de betreffende regel letterlijk toe, gebruik makend van de hoek van <M>{α}^\circ.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={basicTrigonometryInDegrees} validate={validWithVariables(b)} />
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
			const { b } = state
			return <>
				<Par>Bepaal hoeveel geldige oplossingen deze vergelijking heeft.</Par>
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{b}</M>.</>,
						<>Er is één oplossing voor <M>{b}</M>.</>,
						<>Er zijn twee oplossingen voor <M>{b}</M>.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, a, b, c } = state
			return <>
				<Par>Meetkundig kunnen we zien dat er twee mogelijke driehoeken zijn die aan de gegevens voldoen. Gegeven zijn de zijden van <M>{a}</M> en <M>{c}</M> en daaropvolgend de hoek van <M>{α}^\circ.</M> Als we in de figuur de zijde van <M>{a}</M> draaien, zodat <M>{b}</M> kleiner wordt, dan zien we dat er nog een tweede driehoek mogelijk is, ook met een hoek van <M>{α}^\circ.</M> Er zijn dus twee driehoeken mogelijk.</Par>
				<Par>Rekenkundig kunnen we ook zien dat er twee oplossingen zijn. De gegeven vergelijking is namelijk een kwadratische vergelijking in <M>{b}.</M> De discriminant van deze vergelijking is positief, en dus heeft de vergelijking twee oplossingen. Deze oplossingen uitrekenen zal aantonen dat beide oplossingen positief zijn, en dus bruikbaar.</Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { b } = state
			return <>
				<Par>Los de vergelijking op voor <M>{b}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="b1" prelabel={<M>{b}_1=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} />
						<ExpressionInput id="b2" prelabel={<M>{b}_2=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { equationInStandardForm, b1, b2 } = useSolution()
			return <>
				<Par>Om <M>{state.b}</M> te vinden zetten we eerst de vergelijking in standaard vorm. Zo krijgen we <BM>{equationInStandardForm}.</BM> Via de wortelformule (ABC-formule) vinden we nu direct de twee oplossingen als <BMList>
					<BMPart>{state.b}_1 = {b1},</BMPart>
					<BMPart>{state.b}_2 = {b2}.</BMPart>
				</BMList>
					Eventueel kunnen we deze oplossingen nog als getal uitrekenen. Zo krijgen we <M>{state.b}_1 \approx {new Float(roundToDigits(b1.number, 3))}</M> en <M>{state.b}_2 \approx {new Float(roundToDigits(b2.number, 3))}.</M> Beide getallen zijn positief, en dus geldige afstanden.</Par>
				<Par>Overigens is de bij de vraag getekende figuur gebaseerd op <M>{state.b}_2.</M> We kunnen met <M>{state.b}_1</M> ook nog een driehoek tekenen. We krijgen dan de onderstaande afbeelding.</Par>
				<ExerciseFigure useAlternative={true} />
			</>
		},
	},
]

function getFeedback(exerciseData) {
	const { state } = exerciseData

	// Determine MC feedback text in various cases.
	const ruleText = [
		<>Nee. Er zijn drie zijden betrokken en slechts één hoek, en dus is de sinusregel hier niet handig om te gebruiken. Dan moeten er minimaal twee betrokken hoeken zijn.</>,
		<>Ja! Er zijn immers drie zijden betrokken bij ons probleem: twee bekende en één onbekende.</>,
	]
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Dit is niet correct. Kijk of je de lijn van <M>{state.a}</M> kan draaien richting de hoek van <M>{state.α}^\circ.</M> Is er nog een tweede driehoek mogelijk met de gegeven waarden?</>,
		<>Ja! Als we in de figuur de lijn van <M>{state.a}</M> draaien, richting de hoek van <M>{state.α}^\circ,</M> dan is er nog een tweede driehoek met de gegeven waarden te maken. De waarde voor <M>{state.b}</M> is dan kleiner.</>,
	]

	// Set up feedback checks for the equation field.
	const leftSideNoSquare = (input, correct, solution, isCorrect) => !isCorrect && (!input.left.isSubtype('Power') || !input.left.exponent.equals(Integer.two)) && <>De cosinusregel heeft aan de linkerkant een kwadraat. Dat is bij jouw vergelijking niet het geval.</>
	const equationChecks = [leftSideNoSquare, hasIncorrectSide]

	return {
		...getMCFeedback('rule', exerciseData, { text: ruleText }),
		...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
		...getInputFieldFeedback('equation', exerciseData, { feedbackChecks: equationChecks }),
		...getInputFieldListFeedback(['b1', 'b2'], exerciseData),
	}
}

function ExerciseFigure({ useAlternative }) {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution, useAlternative)
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
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}^\circ</M></CornerLabel>
	</Drawing>
}

function getPoints(solution, useAlternative = false) {
	const { b1, b2, c, α } = solution
	const b = useAlternative ? b2 : b1
	const αRad = deg2rad(α.number)
	return [
		new Vector(0, 0),
		new Vector(c.number, 0),
		new Vector(b.number * Math.cos(αRad), b.number * Math.sin(αRad)),
	]
}
