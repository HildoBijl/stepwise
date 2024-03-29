import React from 'react'

import { deg2rad, roundToDigits, numberArray } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { Drawing, Polygon, CornerLabel, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { MultipleChoice, ExpressionInput, EquationInput } from 'ui/inputs'
import { useExerciseData, StepExercise, useSolution, equationChecks, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

const { hasIncorrectSide } = equationChecks

const ruleNames = ['sinusregel', 'cosinusregel']

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ α, β, a, c }) => {
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met hoeken van <M>{α}^\circ</M> en <M>{β}^\circ.</M> De zijde tussen deze hoeken is <M>{c}</M>. Bereken de lengte van de zijde <M>{a}</M> tegenover de hoek van <M>{α}^\circ.</M> Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{a}</M>.</>,
				<>Er is één oplossing voor <M>{a}</M>.</>,
				<>Er zijn twee oplossingen voor <M>{a}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`a${numSolutions > 1 ? index : ''}`} prelabel={<M>{a}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} persistent={true} />)}
			</Par> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Bereken de resterende hoek <M>γ</M> van de driehoek. Geef je antwoord in graden.</Par>
				<ExerciseFigure showGamma={true} />
				<InputSpace>
					<ExpressionInput id="γ" prelabel={<M>γ=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} />
				</InputSpace>
			</>
		},
		Solution: ({ α, β, γ }) => {
			return <Par>De som van de hoeken van een driehoek is altijd <M>180^\circ</M> waardoor <BM>{α}^\circ + {β}^\circ + γ = 180^\circ.</BM> De oplossing voor <M>γ</M> is <BM>γ = 180^\circ - {α}^\circ - {β}^\circ = {γ}^\circ.</BM></Par>
		},
	},
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
		Problem: ({ a, c }) => {
			return <>
				<Par>Pas de betreffende regel letterlijk toe, gebruik makend van de zijden <M>{a}</M> en <M>{c}.</M> Noteer de vergelijking.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={EquationInput.settings.basicTrigonometryInDegrees} validate={EquationInput.validation.validWithVariables(a)} />
				</InputSpace>
			</>
		},
		Solution: ({ c, α, γ, equation, variables }) => {
			return <Par>We passen de sinusregel toe op zijden <M>{variables.a}</M> en <M>{c}.</M> Tegenover zijde <M>{variables.a}</M> is de hoek <M>{α}^\circ.</M> Tegenover zijde <M>{c}</M> is de hoek <M>{γ}^\circ.</M> De sinusregel zegt nu dat <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: ({ a }) => {
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
		Solution: ({ variables }) => {
			return <>
				<Par>Meetkundig kunnen we zien dat er maar één mogelijke driehoek is die aan de gegevens voldoet. Immers, als we vanaf de bekende zijde de gegeven hoeken tekenen, en de lijnen doortrekken, dan krijgen we exact één snijpunt. Er is dus maar één driehoek die aan de gegeven waarden voldoet.</Par>
				<Par>Rekenkundig kunnen we ook zien dat er maar één oplossing is. Om <M>{variables.a}</M> te vinden hoeven we geen sinus om te keren of een kwadratische vergelijking op te lossen. We hebben slechts een lineaire vergelijking in <M>{variables.a}.</M> Er is dus exact één oplossing voor <M>{variables.a}.</M></Par>
			</>
		},
	},
	{
		Problem: ({ a }) => {
			return <>
				<Par>Los de vergelijking op voor <M>{a}.</M> Gebruik wiskundige notatie: je mag eventuele functies als sin/cos/tan in je antwoord laten staan.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="a" prelabel={<M>{a}=</M>} size="m" settings={ExpressionInput.settings.basicTrigonometryInDegrees} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ aRaw, equation, variables }) => {
			return <Par>Om <M>{variables.a}</M> te vinden vermenigvuldigen we beide kanten van de vergelijking met <M>{equation.left.denominator}.</M> Zo vinden we <BM>{variables.a} = {aRaw}.</BM> Hiermee is de gevraagde zijde berekend. Het zou overeen komen met een waarde van <M>{variables.a} \approx {new Float(roundToDigits(aRaw.number, 3))}</M> wat lijkt te kloppen met de afbeelding.</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine MC feedback text in various cases.
	const ruleText = [
		<>Klopt. Er zijn slechts twee zijden betrokken, dus is de sinusregel de regel die we willen gebruiken.</>,
		<>Nee. De cosinusregel is alleen te gebruiken indien je drie betrokken zijden hebt. Die hebben we hier niet.</>,
	]
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Inderdaad. Er is één driehoek die aan de gegeven waarden voldoet.</>,
		<>Nee, er zijn geen twee driehoeken die aan de gegeven waarden voldoen. Als je vanaf de gegeven zijde de lijnen met de gegeven hoeken tekent, dan is er maar één snijpunt mogelijk.</>,
	]

	// Set up feedback checks for the equation field.
	const someSideNoFraction = (input, correct, solution, isCorrect) => !isCorrect && (!input.left.isSubtype('Fraction') || !input.right.isSubtype('Fraction')) && <>De sinusregel heeft aan beide kanten van de vergelijking een breuk. Dat is nu niet het geval.</>
	const equationChecks = [someSideNoFraction, hasIncorrectSide]

	return {
		...getMCFeedback(exerciseData, { rule: ruleText, numSolutions: numSolutionsText }),
		...getFieldInputFeedback(exerciseData, { γ: {}, equation: equationChecks, a: {} }),
	}
}

function ExerciseFigure({ showGamma }) {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution)
	const { rotation, reflection, α, β, a, c } = state

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
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}^\circ</M></CornerLabel>
		<CornerLabel points={[points[0], points[1], points[2]]} graphicalSize={labelSize}><M>{β}^\circ</M></CornerLabel>
		{showGamma ? <CornerLabel points={[points[1], points[2], points[0]]} graphicalSize={labelSize}><M>γ</M></CornerLabel> : null}
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
