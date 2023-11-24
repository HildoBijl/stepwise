import React from 'react'

import { deg2rad, roundToDigits, numberArray } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { Par, M, BM } from 'ui/components'
import { Drawing, Polygon, CornerLabel, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { MultipleChoice, ExpressionInput, EquationInput } from 'ui/inputs'

import { useExerciseData } from 'ui/eduTools'
import { useSolution } from 'ui/eduTools'
import StepExercise from '../types/StepExercise'
import { hasIncorrectSide } from '../util/feedbackChecks/equation'

import { getInputFieldFeedback, getInputFieldListFeedback, getMCFeedback } from '../util/feedback'

const ruleNames = ['sinusregel', 'cosinusregel']

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { α, γ, a, c } = state
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met zijden van <M>{a}</M> en <M>{c}.</M> De hoek tegenover de zijde van <M>{a}</M> is <M>{α}^\circ.</M> Bereken de hoek <M>{γ}</M> tegenover de zijde van <M>{c}.</M> Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{γ}</M>.</>,
				<>Er is één oplossing voor <M>{γ}</M>.</>,
				<>Er zijn twee oplossingen voor <M>{γ}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`γ${numSolutions > 1 ? index : ''}`} prelabel={<M>{γ}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} persistent={true} />)}
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
					<MultipleChoice id="rule" choices={ruleNames.map((ruleName) => <>Gebruik de {ruleName}.</>)} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Er zijn bij dit probleem slechts twee zijden betrokken. De derde zijde weten we niet en hoeven we ook niet te weten. Dit betekent dat we de sinusregel nodig hebben.</Par>
		},
	},
	{
		Problem: (state) => {
			const { γ, a, c } = state
			return <>
				<Par>Pas de betreffende regel letterlijk toe, gebruik makend van de zijden <M>{a}</M> en <M>{c}.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={EquationInput.settings.basicTrigonometryInDegrees} validate={EquationInput.validation.validWithVariables(γ)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, γ, a, c } = state
			const { equation } = useSolution()
			return <Par>We passen de sinusregel toe op zijden <M>{a}</M> en <M>{c}.</M> Tegenover zijde <M>{a}</M> is de hoek <M>{α}^\circ.</M> Tegenover zijde <M>{c}</M> staat hoek <M>{γ}.</M> De sinusregel zegt nu dat <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { γ } = state
			return <>
				<Par>Bepaal hoeveel geldige oplossingen deze vergelijking heeft.</Par>
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{γ}</M>.</>,
						<>Er is één oplossing voor <M>{γ}</M>.</>,
						<>Er zijn twee oplossingen voor <M>{γ}</M>.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, γ, a, c } = state
			return <>
				<Par>Meetkundig kunnen we zien dat er twee mogelijke driehoeken zijn die aan de gegevens voldoen. Gegeven zijn de zijden van <M>{a}</M> en <M>{c}</M> en daaropvolgend de hoek van <M>{α}^\circ.</M> Als we in de figuur de zijde van <M>{a}</M> draaien, zodat de resterende zijde kleiner wordt, dan zien we dat er nog een tweede driehoek mogelijk is, ook met een hoek van <M>{α}^\circ.</M> Er zijn dus twee driehoeken mogelijk.</Par>
				<Par>Rekenkundig kunnen we ook zien dat er twee oplossingen zijn. Om de vergelijking op te lossen voor <M>{γ}</M> moeten we namelijk een sinus omkeren. Als we dit doen, dan is er ook nog een tweede oplossing mogelijk binnen het bereik van <M>0^\circ</M> tot <M>180^\circ.</M> Dus zijn er twee mogelijke oplossing.</Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { γ } = state
			return <>
				<Par>Los de vergelijking op voor <M>{γ}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="γ1" prelabel={<M>{γ}_1=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} />
						<ExpressionInput id="γ2" prelabel={<M>{γ}_2=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { intermediateEquation, γ1, γ2 } = useSolution()
			return <>
				<Par>Om <M>{state.γ}</M> te vinden lossen we eerst <M>{intermediateEquation.left}</M> op. Zo vinden we <BM>{intermediateEquation}.</BM> Als we de omgekeerde sinus op beide kanten toepassen, dan vinden we de eerste oplossing <BM>{state.γ}_1 = {γ1}.</BM> Dit is echter niet de enige oplossing. Bij het omkeren van een sinus moeten we ook altijd nog de tweede oplossing meenemen, zijnde <BM>{state.γ}_2 = 180^\circ - {state.γ}_1 = 180^\circ - {γ1}.</BM> Hiermee zijn de twee oplossingen bekend.</Par>
				<Par>Eventueel kunnen we de twee oplossingen nog als getal uitrekenen. Zo krijgen we <M>{state.γ}_1 \approx {new Float(roundToDigits(γ1.number, 3))}^\circ</M> en <M>{state.γ}_2 \approx {new Float(roundToDigits(γ2.number, 3))}^\circ.</M> De bij de vraag getekende figuur is gebaseerd op <M>{state.γ}_1.</M> We kunnen met <M>{state.γ}_2</M> ook nog een driehoek tekenen. We krijgen dan de onderstaande afbeelding.</Par>
				<ExerciseFigure useAlternative={true} />
			</>
		},
	},
]

function getFeedback(exerciseData) {
	const { state } = exerciseData

	// Determine MC feedback text in various cases.
	const ruleText = [
		<>Klopt. Er zijn slechts twee zijden betrokken, dus is de sinusregel de regel die we willen gebruiken.</>,
		<>Nee. De cosinusregel is alleen te gebruiken indien je drie betrokken zijden hebt. Die hebben we hier niet.</>,
	]
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Dit is niet correct. Kijk of je de lijn van <M>{state.a}</M> kan draaien richting de hoek van <M>{state.α}^\circ.</M> Is er nog een tweede driehoek mogelijk met de gegeven waarden?</>,
		<>Ja! Als we in de figuur de lijn van <M>{state.a}</M> draaien, richting de hoek van <M>{state.α}^\circ,</M> dan is er nog een tweede driehoek met de gegeven waarden te maken. De overige (onbekende) zijde is dan kleiner.</>,
	]

	// Set up feedback checks for the equation field.
	const someSideNoFraction = (input, correct, solution, isCorrect) => !isCorrect && (!input.left.isSubtype('Fraction') || !input.right.isSubtype('Fraction')) && <>De sinusregel heeft aan beide kanten van de vergelijking een breuk. Dat is nu niet het geval.</>
	const equationChecks = [someSideNoFraction, hasIncorrectSide]

	return {
		...getMCFeedback('rule', exerciseData, { text: ruleText }),
		...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
		...getInputFieldFeedback('equation', exerciseData, { feedbackChecks: equationChecks }),
		...getInputFieldListFeedback(['γ1', 'γ2'], exerciseData),
	}
}

function ExerciseFigure({ useAlternative }) {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution, useAlternative)
	const { rotation, reflection, α, γ, a, c } = state

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
		<LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{a}</M></LineLabel>
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{c}</M></LineLabel>
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}^\circ</M></CornerLabel>
		<CornerLabel points={[points[1], points[2], points[0]]} graphicalSize={labelSize}><M>{γ}</M></CornerLabel>
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
