import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { validWithVariables as expressionValidWithVariables, basicMath } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables as equationValidWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { hasX, incorrectFraction, incorrectExpression } from '../util/feedbackChecks/expression'
import { originalEquation, correctEquation, incorrectEquation, hasFraction, hasSumWithinProduct } from '../util/feedbackChecks/equation'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, equation } = useSolution(state)
	return <>
		<Par>Gegeven is de vergelijking <BM>{equation}.</BM> Los deze op voor <M>{variables.x}.</M></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={expressionValidWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { variables, factor1, factor2 } = useSolution(state)
			return <>
				<Par>Het lastige is dat de onbekende <M>{variables.x}</M> onderin een breuk staat. Verhelp dit probleem door alle termen met zowel <M>{factor1}</M> als <M>{factor2}</M> te vermenigvuldigen. Streep waar mogelijk factoren in breuken weg.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="multiplied" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { factor1, factor2, multiplied } = useSolution(state)
			return <Par>We vermenigvuldigen alle termen met zowel <M>{factor1}</M> als <M>{factor2}.</M> Bij de eerste term links valt <M>{factor2}</M> onderin de breuk weg, en vermenigvuldigen we het restant met <M>{factor1}.</M> Bij de andere twee termen valt juist <M>{factor1}</M> weg en wordt het restant vermenigvuldigd met <M>{factor2}.</M> Het resultaat is dan <BM>{multiplied}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Werk alle haakjes uit.</Par>
				<InputSpace>
					<Par>
						<EquationInput id="expanded" size="l" settings={basicMath} validate={equationValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { expanded } = useSolution(state)
			return <Par>Als we alle haakjes op de normale wijze uitwerken krijgen we <BM>{expanded}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const { variables } = useSolution(state)
			return <>
				<Par>Het resultaat is een lineaire vergelijking. Los deze op de normale wijze op.</Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={expressionValidWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, expanded, shifted, pulledOut, bracketFactor, ans } = useSolution(state)
			return <Par>Voor het oplossen van een lineaire vergelijking brengen we eerst alle termen met <M>{variables.x}</M> naar de ene kant en alle termen zonder <M>{variables.x}</M> naar de andere kant. Oftewel, <M>{expanded.right.terms[0].abs()}</M> gaat naar links en <M>{expanded.left.terms[3].abs()}</M> gaat naar rechts. Zo vinden we <BM>{shifted}.</BM> Vervolgens brengen we <M>{variables.x}</M> buiten haakjes. Dit zet het bovenstaande om in <BM>{pulledOut}.</BM> We delen tenslotte beide kanten van de vergelijking door <M>{bracketFactor}</M> om <M>{variables.x}</M> op te lossen. Het eindresultaat is <BM>{variables.x} = {ans}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	window.e = exerciseData
	// Determine feedback.
	return getInputFieldFeedback([
		'ans',
		'multiplied',
		'expanded',
	], exerciseData, [
		[hasX, incorrectFraction, incorrectExpression],
		[originalEquation, hasFraction, incorrectEquation, correctEquation],
		[hasSumWithinProduct, hasFraction, incorrectEquation, correctEquation],
	].map(feedbackChecks => ({ feedbackChecks })))
}